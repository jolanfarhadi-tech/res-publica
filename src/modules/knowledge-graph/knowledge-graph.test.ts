import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { frontmatterEntityExtractor } from "./extractors/frontmatter-extractor";
import { buildKnowledgeGraph } from "./build";
import { lookupEntity, relatedEntities, searchEntities } from "./api";
import { createGraphCandidateDrafts, graphContentDigest } from "./candidates";
import { ownsGraphType } from "./schema-registry";
import type { KnowledgeGraph } from "./types";

describe("frontmatterEntityExtractor", () => {
  it("returns an empty array when no entities field is present", () => {
    expect(frontmatterEntityExtractor.extract({ frontmatter: { title: "x" }, body: "" })).toEqual([]);
  });

  it("extracts declared entities from frontmatter", () => {
    const result = frontmatterEntityExtractor.extract({
      frontmatter: { entities: [{ id: "e1", type: "person", name: "Jane Doe" }] },
      body: "",
    });
    expect(result).toEqual([{ id: "e1", type: "person", name: "Jane Doe" }]);
  });

  it("ignores malformed entity declarations rather than throwing", () => {
    const result = frontmatterEntityExtractor.extract({
      frontmatter: { entities: [{ id: "e1" /* missing type/name */ }] },
      body: "",
    });
    expect(result).toEqual([]);
  });
});

describe("buildKnowledgeGraph", () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("finds zero entities when no content declares any (today's real-content state)", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
    fs.writeFileSync(path.join(tmpDir, "page.mdx"), "---\ntitle: Test\ndescription: Test\n---\nBody.");
    const graph = buildKnowledgeGraph(tmpDir, tmpDir);
    expect(graph.entities.size).toBe(0);
    expect(graph.relationships.length).toBe(0);
  });

  it("extracts entities and co-occurrence relationships from declared frontmatter", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
    const frontmatter = [
      "---",
      "title: Test",
      "description: Test",
      "entities:",
      "  - id: e1",
      "    type: person",
      "    name: Jane Doe",
      "  - id: e2",
      "    type: topic",
      "    name: Participation",
      "---",
      "Body mentions both.",
    ].join("\n");
    fs.writeFileSync(path.join(tmpDir, "page.mdx"), frontmatter);

    const graph = buildKnowledgeGraph(tmpDir, tmpDir);
    expect(graph.entities.size).toBe(2);
    expect(graph.entities.get("e1")?.canonicalName).toBe("Jane Doe");
    expect(graph.entities.get("e1")?.domain).toBe("civic");
    expect(graph.relationships).toHaveLength(1);
    expect(graph.relationships[0]).toMatchObject({ fromEntityId: "e1", toEntityId: "e2", type: "co-occurs" });
  });

  it("is byte-for-byte deterministic and records public projection eligibility", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
    fs.mkdirSync(path.join(tmpDir, "de", "projects"), { recursive: true });
    const frontmatter = [
      "---",
      "title: Public source",
      "description: Public source",
      "date: 2026-08-10",
      "visibility: public",
      "reviewed: true",
      "source: docs/source/foundation/01_HARM_OPERATING_SYSTEM.md",
      "entities:",
      "  - id: topic:harm",
      "    type: topic",
      "    name: HARM",
      "  - id: organization:res-publica",
      "    type: organization",
      "    name: Res Publica e.V.",
      "---",
      "Grounded body.",
    ].join("\n");
    fs.writeFileSync(path.join(tmpDir, "de", "projects", "harm.mdx"), frontmatter);

    const first = buildKnowledgeGraph(tmpDir, tmpDir);
    const second = buildKnowledgeGraph(tmpDir, tmpDir);

    expect([...first.entities.entries()]).toEqual([...second.entities.entries()]);
    expect(first.relationships).toEqual(second.relationships);
    expect(first.entities.get("topic:harm")?.sources[0]).toMatchObject({
      locale: "de",
      publicEligible: true,
      canonicalSource: "docs/source/foundation/01_HARM_OPERATING_SYSTEM.md",
    });
    expect(first.relationships[0].source.publicEligible).toBe(true);
  });

  it("keeps unreviewed or ungrounded source declarations out of public projection", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
    fs.writeFileSync(
      path.join(tmpDir, "internal.mdx"),
      "---\ntitle: Internal\ndescription: Internal\nvisibility: public\nreviewed: false\nentities:\n  - id: e1\n    type: topic\n    name: Internal topic\n---\nBody."
    );
    const graph = buildKnowledgeGraph(tmpDir, tmpDir);
    expect(graph.entities.get("e1")?.sources[0].publicEligible).toBe(false);
  });

  it("merges the same entity id declared across multiple files, tracking every source and alias", () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg-test-"));
    const page1 = "---\ntitle: A\ndescription: A\nentities:\n  - id: e1\n    type: person\n    name: Jane Doe\n---\nA.";
    const page2 = "---\ntitle: B\ndescription: B\nentities:\n  - id: e1\n    type: person\n    name: Jane D.\n---\nB.";
    fs.writeFileSync(path.join(tmpDir, "a.mdx"), page1);
    fs.writeFileSync(path.join(tmpDir, "b.mdx"), page2);

    const graph = buildKnowledgeGraph(tmpDir, tmpDir);
    expect(graph.entities.size).toBe(1);
    const entity = graph.entities.get("e1")!;
    expect(entity.sources).toHaveLength(2);
    expect(entity.aliases).toHaveLength(2);
  });
});

describe("Knowledge Graph API", () => {
  function sampleGraph(): KnowledgeGraph {
    return {
      entities: new Map([
        ["e1", { id: "e1", domain: "civic", type: "person", canonicalName: "Jane Doe", aliases: [], sources: [] }],
        ["e2", { id: "e2", domain: "civic", type: "topic", canonicalName: "Participation", aliases: [], sources: [] }],
        ["e3", {
          id: "e3",
          domain: "governance",
          type: "topic",
          canonicalName: "Institutional Answerability",
          aliases: [{ locale: "en", name: "Participation review" }],
          sources: [],
        }],
      ]),
      relationships: [{
        domain: "civic",
        fromEntityId: "e1",
        toEntityId: "e2",
        type: "co-occurs",
        source: { file: "x", locale: "de", canonicalSource: "source.md", publicEligible: true },
      }],
    };
  }

  it("looks up an entity by id", () => {
    expect(lookupEntity(sampleGraph(), "e1")?.canonicalName).toBe("Jane Doe");
    expect(lookupEntity(sampleGraph(), "missing")).toBeUndefined();
  });

  it("finds related entities via any relationship direction", () => {
    const related = relatedEntities(sampleGraph(), "e2");
    expect(related.map((e) => e.id)).toEqual(["e1"]);
  });

  it("searches entities by name substring, case-insensitively", () => {
    const results = searchEntities(sampleGraph(), "jane");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("e1");
  });

  it("can constrain queries to the owning domain", () => {
    expect(searchEntities(sampleGraph(), "participation", "governance").map((entity) => entity.id)).toEqual(["e3"]);
    expect(searchEntities(sampleGraph(), "participation", "civic").map((entity) => entity.id)).toEqual(["e2"]);
    expect(searchEntities(sampleGraph(), "topic", "civic").map((entity) => entity.id)).toEqual(["e2"]);
  });
});

describe("governed graph candidates", () => {
  it("aggregates multilingual relationship provenance into one deterministic candidate", () => {
    const source = (file: string, locale: string) => ({
      file,
      locale,
      canonicalSource: "canonical.md",
      publicEligible: true,
    });
    const graph: KnowledgeGraph = {
      entities: new Map([
        ["a", { id: "a", domain: "civic", type: "topic", canonicalName: "A", aliases: [], sources: [source("de/a.mdx", "de")] }],
        ["b", { id: "b", domain: "civic", type: "topic", canonicalName: "B", aliases: [], sources: [source("de/b.mdx", "de")] }],
      ]),
      relationships: [
        { domain: "civic", fromEntityId: "a", toEntityId: "b", type: "co-occurs", source: source("de/a.mdx", "de") },
        { domain: "civic", fromEntityId: "a", toEntityId: "b", type: "co-occurs", source: source("fa/a.mdx", "fa") },
      ],
    };
    const first = createGraphCandidateDrafts(graph);
    const second = createGraphCandidateDrafts(graph);
    const relationship = first.find((candidate) => candidate.kind === "relationship");
    expect(relationship?.sources).toHaveLength(2);
    expect(first).toEqual(second);
    expect(graphContentDigest(first)).toBe(graphContentDigest(second));
  });

  it("keeps schema meaning with the owning domain", () => {
    expect(ownsGraphType("civic", "entity", "topic")).toBe(true);
    expect(ownsGraphType("governance", "entity", "topic")).toBe(false);
    expect(ownsGraphType("governance", "relationship", "co-occurs")).toBe(false);
  });
});
