import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { frontmatterEntityExtractor } from "./extractors/frontmatter-extractor";
import { buildKnowledgeGraph } from "./build";
import { lookupEntity, relatedEntities, searchEntities } from "./api";
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
    expect(graph.relationships).toHaveLength(1);
    expect(graph.relationships[0]).toMatchObject({ fromEntityId: "e1", toEntityId: "e2", type: "co-occurs" });
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
        ["e1", { id: "e1", type: "person", canonicalName: "Jane Doe", aliases: [], sources: [] }],
        ["e2", { id: "e2", type: "topic", canonicalName: "Participation", aliases: [], sources: [] }],
      ]),
      relationships: [{ fromEntityId: "e1", toEntityId: "e2", type: "co-occurs", source: { file: "x", locale: "de" } }],
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
});
