import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCopy } from "../i18n/academy";
import { locales } from "../i18n/config";

describe("Academy public, member and operations presentation", () => {
  it("provides the approved public and protected route hierarchy", () => {
    for (const route of [
      "academy/page.tsx",
      "academy/courses/page.tsx",
      "academy/courses/[slug]/page.tsx",
      "academy/programs/[slug]/page.tsx",
      "dashboard/academy/page.tsx",
      "operations/academy/page.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), "src", "app", "[locale]", route)), route).toBe(true);
    }
  });

  it("keeps Academy UI complete in DE, EN and FA without accreditation claims", () => {
    const keys = Object.keys(academyCopy.de);
    for (const locale of locales) {
      expect(Object.keys(academyCopy[locale])).toEqual(keys);
      expect(Object.values(academyCopy[locale]).every((value) => value.trim().length > 0)).toBe(true);
    }
    expect(academyCopy.fa.title).toMatch(/[\u0600-\u06ff]/);
    expect(academyCopy.fa.nonAccredited).toContain("اعتباربخشی");
    expect(academyCopy.de.nonAccredited).toContain("keine");
    expect(academyCopy.en.nonAccredited).toContain("do not imply");
  });

  it("keeps the public catalogue free of person, assessment-response and staff identifiers", () => {
    const source = readFileSync(join(process.cwd(), "src", "application", "academy.ts"), "utf8");
    const projection = source.slice(
      source.indexOf("export async function listPublishedAcademyCatalog"),
      source.indexOf("export async function assignAcademyInstructor")
    );
    expect(projection).not.toContain("personId:");
    expect(projection).not.toContain("response:");
    expect(projection).not.toContain("createdByPersonId:");
    expect(projection).not.toContain("approvedByPersonId:");
  });
});
