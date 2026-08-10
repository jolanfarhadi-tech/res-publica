import { describe, expect, it } from "vitest";
import { buildSearchIndex } from "./search";

describe("public search Knowledge Graph projection", () => {
  it.each(["de", "en", "fa"] as const)(
    "grounds the %s HARM project in deterministic entity declarations",
    async (locale) => {
      const index = await buildSearchIndex(locale);
      const harm = index.find((document) => document.url === `/${locale}/projects/harm-research`);
      expect(harm?.knowledgeGraphEntityIds).toEqual([
        "organization:res-publica",
        "topic:harm",
      ]);
    }
  );

  it("does not place internal or unreviewed collection records in the index", async () => {
    const index = await buildSearchIndex("de");
    expect(index.every((document) => !document.url.includes("buergerdialog-2026"))).toBe(true);
  });
});
