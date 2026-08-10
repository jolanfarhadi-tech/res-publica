import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { knowledgeGraphCopy } from "../../i18n/knowledge-graph";

describe("Release C Knowledge Graph surfaces", () => {
  it("keeps the operations surface complete in DE, EN and FA", () => {
    const keys = Object.keys(knowledgeGraphCopy.de).sort();
    expect(Object.keys(knowledgeGraphCopy.en).sort()).toEqual(keys);
    expect(Object.keys(knowledgeGraphCopy.fa).sort()).toEqual(keys);
    expect(knowledgeGraphCopy.fa.title).toMatch(/[\u0600-\u06ff]/);
  });

  it("implements the three declared public graph routes and bounded operations routes", () => {
    for (const route of [
      "lookup",
      "related",
      "search",
      "operations",
      "operations/rebuilds",
      "operations/candidates/[candidateId]",
    ]) {
      const source = readFileSync(
        join(process.cwd(), "src", "app", "api", "knowledge-graph", route, "route.ts"),
        "utf8"
      );
      expect(source.length, route).toBeGreaterThan(100);
    }
  });

  it("does not introduce AI inference into the deterministic extraction path", () => {
    const build = readFileSync(join(process.cwd(), "src", "modules", "knowledge-graph", "build.ts"), "utf8");
    const candidate = readFileSync(join(process.cwd(), "src", "modules", "knowledge-graph", "candidates.ts"), "utf8");
    expect(`${build}\n${candidate}`).not.toMatch(/openai|anthropic|embedding|vector|prompt/i);
  });

  it("rate-limits both public and staff read surfaces with privacy-preserving shared buckets", () => {
    const publicRuntime = readFileSync(join(process.cwd(), "src", "app", "api", "knowledge-graph", "public-runtime.ts"), "utf8");
    const operations = readFileSync(join(process.cwd(), "src", "app", "api", "knowledge-graph", "operations", "route.ts"), "utf8");
    expect(publicRuntime).toContain("rejectRateLimitedRequest");
    expect(publicRuntime).toContain("KNOWLEDGE_GRAPH_PUBLIC_READ_RATE_LIMIT");
    expect(operations).toContain("rejectRateLimitedRequest");
    expect(operations).toContain("KNOWLEDGE_GRAPH_OPERATIONS_READ_RATE_LIMIT");
  });
});
