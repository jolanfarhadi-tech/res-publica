import fs from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { cinematicCast } from "./cinematic-people";

describe("editorial redesign boundaries", () => {
  const home = fs.readFileSync("src/app/[locale]/page.tsx", "utf8");
  it("removes the redundant visible section labels but keeps accessible headings", () => {
    expect(home).not.toContain("{copy.gateways.eyebrow}");
    expect(home).not.toContain("{copy.featured.latestEyebrow}");
    expect(home).toContain('id="gateways-title" className="sr-only"');
    expect(home).toContain('id="latest-title" className="sr-only"');
  });
  it("formats journey positions using the page locale", () => {
    expect(home).toContain('new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale)');
    expect(home).toContain('{number.format(index + 1)}');
    expect(new Intl.NumberFormat("fa-IR").format(4)).toBe("۴");
  });
  it("uses six different authored characters, not two bodies with recoloured clothes", () => {
    expect(cinematicCast).toHaveLength(6);
    expect(new Set(cinematicCast.map(([name]) => name)).size).toBe(6);
    expect(fs.readFileSync("src/components/site/cinematic-renderer.ts", "utf8")).toContain("person(i / 3, true)");
  });
  it("does not invent publications or activate membership/research flows", () => {
    expect(home).toContain('getEntries(locale, "publications")');
    expect(home).toContain('getEntries(locale, "news")');
    expect(home).toContain('href={`/${locale}/membership`}');
    expect(home).not.toMatch(/RESEARCH_REAL_DATA_ACTIVATION_APPROVED|\/api\/|submitCredential/);
  });
  it("uses swapping Persian fonts and has one invitation reading surface", () => {
    const layout = fs.readFileSync("src/app/[locale]/layout.tsx", "utf8");
    expect(layout).not.toContain('display: "optional"');
    expect(layout).toContain('from "next/font/local"');
    expect(layout).toContain('Vazirmatn-variable.woff2');
    expect(home).not.toContain('bg-night/58');
    expect(home).toContain('className="home-close__panel"');
  });
  it("keeps all three local fonts and their licenses intact without remote font fetching", () => {
    const manifest = JSON.parse(fs.readFileSync("src/app/fonts/manifest.json", "utf8"));
    expect(manifest.records).toHaveLength(6);
    for (const record of manifest.records) {
      const bytes = fs.readFileSync(`src/app/fonts/${record.file}`);
      expect(bytes.length).toBe(record.bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(record.sha256);
    }
  });
});
