import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  hasOperationalCallToAction,
  publicOfferings,
} from "../data/public-offerings";
import { collections, getEntries, getSlugs } from "../lib/collections";
import { locales } from "../i18n/config";
import { partners } from "../data/partners";
import { team } from "../data/team";
import { publicSiteCopy } from "../i18n/public-site";
import { getDirection } from "../i18n/config";
import { publicNavigation } from "../data/public-navigation";

const source = (...parts: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...parts), "utf8");

describe("public website boundaries", () => {
  it("does not market internal infrastructure as a product", () => {
    const ids = publicOfferings.map((offering) => offering.id);
    expect(ids).not.toContain("ai-layer");
    expect(ids).not.toContain("eao");
    expect(ids).not.toContain("publishing-authority");
    expect(ids).not.toContain("database");
    expect(ids).not.toContain("audit");
  });

  it("suppresses operational calls to action for non-operational offerings", () => {
    for (const offering of publicOfferings) {
      if (!offering.operational) {
        expect(hasOperationalCallToAction(offering)).toBe(false);
      }
    }
  });

  it("requires explicit publication provenance for collection entries", () => {
    for (const collection of collections) {
      expect(getSlugs(collection)).toEqual([]);
      for (const locale of locales) {
        expect(getEntries(locale, collection)).toEqual([]);
      }
    }
  });

  it("does not expose placeholder people or partnerships", () => {
    expect(team).toEqual([]);
    expect(partners).toEqual([]);
  });

  it("contains no Publishing Authority write calls in public frontend source", () => {
    const publicFiles = [
      source("src", "app", "[locale]", "page.tsx"),
      source("src", "components", "site", "OfferingMatrix.tsx"),
      source("src", "components", "site", "ConstellationNarrative.tsx"),
    ].join("\n");
    expect(publicFiles).not.toMatch(/\/api\/publishing/);
  });

  it("provides a complete static text equivalent for the constellation", () => {
    const constellation = source(
      "src",
      "components",
      "site",
      "ConstellationNarrative.tsx"
    );
    expect(constellation).toContain("<figcaption");
    expect(constellation).toContain('aria-hidden="true"');
  });

  it("keeps the contact experience truthful", () => {
    const contact = source("src", "components", "site", "ContactForm.tsx");
    expect(contact).not.toContain("setSent");
    expect(contact).not.toContain("<form");
    expect(contact).toContain("mailto:kontakt@respublica-ev.de");
  });

  it("provides separate Programs, Products, Services and Projects routes", () => {
    for (const route of ["programs", "products", "services", "projects"]) {
      expect(
        fs.existsSync(path.join(process.cwd(), "src", "app", "[locale]", route, "page.tsx"))
      ).toBe(true);
    }
    const referenceKeys = Object.keys(publicSiteCopy.de.home);
    expect(Object.keys(publicSiteCopy.en.home)).toEqual(referenceKeys);
    expect(Object.keys(publicSiteCopy.fa.home)).toEqual(referenceKeys);
  });

  it("keeps the primary navigation concise and localized", () => {
    for (const locale of locales) {
      const items = publicNavigation(locale);
      expect(items).toHaveLength(7);
      expect(items.map((item) => item.href)).toEqual(
        expect.arrayContaining([
          `/${locale}/programs`,
          `/${locale}/products`,
          `/${locale}/services`,
          `/${locale}/projects`,
        ])
      );
      expect(items.map((item) => item.href)).not.toContain(`/${locale}/offerings`);
    }
  });

  it("classifies RPCS Civic School as a documented Program, never as a Project", () => {
    const rpcs = publicOfferings.find((offering) => offering.id === "rpcs");
    expect(rpcs).toMatchObject({
      category: "programs",
      maturity: "documented",
      operational: false,
    });
    for (const locale of locales) {
      expect(getEntries(locale, "projects").some((entry) => /RPCS|Civic School/i.test(entry.title))).toBe(false);
    }
  });

  it("keeps methodologies out of the product and service catalog", () => {
    const ids = publicOfferings.map((offering) => offering.id);
    expect(ids).not.toContain("harm");
    expect(ids).not.toContain("responsibility-tools");
  });

  it("keeps Persian RTL and a complete reduced-motion fallback", () => {
    expect(getDirection("fa")).toBe("rtl");
    const css = source("src", "app", "globals.css");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-iteration-count: 1");
  });

  it("includes the four public categories, Method and Membership in every localized sitemap", () => {
    const sitemapSource = source("src", "app", "sitemap.ts");
    expect(sitemapSource).toContain('"/method"');
    expect(sitemapSource).toContain('"/programs"');
    expect(sitemapSource).toContain('"/products"');
    expect(sitemapSource).toContain('"/services"');
    expect(sitemapSource).toContain('"/projects"');
    expect(sitemapSource).not.toContain('"/offerings"');
    expect(sitemapSource).toContain('"/membership"');
    expect(sitemapSource).toContain("alternates");
    expect(sitemapSource).toContain("languages");
    expect(sitemapSource).toContain('"x-default"');
    expect(sitemapSource).not.toContain('"/search",');
    expect(sitemapSource).not.toContain('"/profile"');
    expect(sitemapSource).not.toContain('"/dashboard"');
  });

  it("keeps private Profile and Dashboard paths out of public indexing", () => {
    const profile = source("src", "app", "[locale]", "profile", "page.tsx");
    const robots = source("src", "app", "robots.ts");
    expect(profile).toContain("robots: { index: false");
    for (const locale of locales) {
      expect(robots).toContain(`"/${locale}/profile"`);
      expect(robots).toContain(`"/${locale}/dashboard"`);
    }
  });

  it("limits search to published site content and provenance-gated collections", () => {
    const search = source("src", "lib", "search.ts");
    expect(search).toContain('["programs", "products", "services"]');
    expect(search).toContain("url: `/${locale}/${category}`");
    expect(search).not.toContain("url: `/${locale}/offerings`");
    expect(search).toContain("getEntries(locale, collection)");
    expect(search).not.toContain("/api/publishing");
  });
});
