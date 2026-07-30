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
import { getDictionary } from "../i18n/dictionaries";

const source = (...parts: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...parts), "utf8");

describe("public website boundaries", () => {
  it("lazy-loads one locale dictionary through the shared async boundary", async () => {
    const dictionarySource = source("src", "i18n", "dictionaries.ts");
    expect(dictionarySource).not.toMatch(
      /import\s+\w+\s+from\s+["'].+dictionaries\/(de|en|fa)\.json["']/
    );
    for (const locale of locales) {
      expect(dictionarySource).toContain(
        `import("./dictionaries/${locale}.json")`
      );
    }

    const dictionaries = await Promise.all(locales.map(getDictionary));
    const referenceKeys = Object.keys(dictionaries[0]);
    for (const dictionary of dictionaries) {
      expect(Object.keys(dictionary)).toEqual(referenceKeys);
      expect(dictionary.meta.title).toBeTruthy();
    }
  });

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
      for (const locale of locales) {
        for (const entry of getEntries(locale, collection)) {
          expect(entry.visibility).toBe("public");
          expect(entry.reviewed).toBe(true);
          expect(entry.source?.trim()).toBeTruthy();
          expect(getSlugs(collection)).toContain(entry.slug);
        }
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
          `/${locale}/projects`,
          `/${locale}/lab`,
          `/${locale}/research`,
          `/${locale}/publications`,
          `/${locale}/membership`,
          `/${locale}/contact`,
        ])
      );
      expect(items.map((item) => item.href)).not.toContain(
        `/${locale}/products`
      );
      expect(items.map((item) => item.href)).not.toContain(
        `/${locale}/services`
      );
      expect(items.map((item) => item.href)).not.toContain(`/${locale}/offerings`);
    }
  });

  it("presents HARM as a reviewed research project, not a product", () => {
    for (const locale of locales) {
      const entry = getEntries(locale, "projects").find(
        (project) => project.slug === "harm-research"
      );
      expect(entry).toMatchObject({
        visibility: "public",
        reviewed: true,
        status: "ongoing",
      });
      expect(entry?.source).toBe(
        "docs/source/foundation/01_HARM_OPERATING_SYSTEM.md"
      );
    }
    expect(publicOfferings.map((offering) => offering.id)).not.toContain("harm");
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
    const motion = source("src", "components", "motion", "FadeIn.tsx");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-iteration-count: 1");
    expect(motion).toContain("preferences.reduceMotion");
  });

  it("keeps the mobile menu modal, focus-contained and desktop-safe", () => {
    const header = source("src", "components", "site", "Header.tsx");
    const mobileMenu = source(
      "src",
      "components",
      "site",
      "HeaderMobileMenu.tsx"
    );
    const activeLink = source(
      "src",
      "components",
      "site",
      "HeaderNavLink.tsx"
    );
    const css = source("src", "app", "globals.css");
    expect(header).not.toContain('"use client"');
    expect(header).toContain("<HeaderMobileMenu");
    expect(mobileMenu).toContain('"use client"');
    expect(mobileMenu).toContain("<dialog");
    expect(mobileMenu).toContain("showModal()");
    expect(mobileMenu).toContain(
      'className="icon-button inline-grid lg:hidden"'
    );
    expect(activeLink).toContain("usePathname()");
    expect(css).not.toMatch(
      /\.icon-button\s*\{[\s\S]*?display:\s*inline-grid/
    );
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("hyphens: auto");
  });

  it("localizes legal links and keeps structured-data claims bounded", () => {
    const footer = source("src", "components", "site", "Footer.tsx");
    const membership = source(
      "src",
      "components",
      "platform",
      "MembershipForm.tsx"
    );
    const event = source(
      "src",
      "components",
      "platform",
      "EventRegistration.tsx"
    );
    const newsletter = source(
      "src",
      "components",
      "site",
      "NewsletterSignup.tsx"
    );
    expect(footer).toContain("dict.footer.imprint");
    expect(footer).toContain("dict.footer.privacy");
    for (const form of [membership, event, newsletter]) {
      expect(form).toContain("dict.footer.privacy");
      expect(form).toContain("/datenschutz");
    }
    const homepage = source("src", "app", "[locale]", "page.tsx");
    const lab = source("src", "app", "[locale]", "lab", "page.tsx");
    expect(homepage).not.toContain("areaServed");
    expect(lab).toContain('"@type": "CollectionPage"');
    expect(lab).not.toContain('"@type": "ResearchOrganization"');
  });

  it("includes the four public categories, Method and Membership in every localized sitemap", () => {
    const sitemapSource = source("src", "app", "sitemap.ts");
    expect(sitemapSource).toContain('"/method"');
    expect(sitemapSource).toContain('"/lab"');
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

  it("keeps optional consent off by default and necessary storage immutable", () => {
    const preferences = source(
      "src",
      "components",
      "privacy",
      "PreferenceProvider.tsx"
    );
    expect(preferences).toContain("functional: false");
    expect(preferences).toContain("analytics: false");
    expect(preferences).toContain("newsletter: false");
    expect(preferences).toContain("checked");
    expect(preferences).toContain("disabled");
    expect(preferences).not.toMatch(
      /googletagmanager|google-analytics|segment\.com|hotjar/i
    );
    expect(
      fs.existsSync(
        path.join(process.cwd(), "src", "app", "[locale]", "privacy", "page.tsx")
      )
    ).toBe(true);
  });

  it("requires two separate, default-off profile confirmations before membership submission", () => {
    const membership = source(
      "src",
      "components",
      "platform",
      "MembershipForm.tsx"
    );
    expect(membership).toContain("dataProtectionConsent");
    expect(membership).toContain("programmeParticipationConsent");
    expect(membership).toContain(
      "!dataProtectionConsent || !programmeParticipationConsent"
    );
    expect(membership).toContain('href={`/${locale}/datenschutz`}');
    const dataProtectionLabel = membership.match(
      /<label[\s\S]*?htmlFor="data-protection-consent"[\s\S]*?<\/label>/
    )?.[0];
    expect(dataProtectionLabel).toBeTruthy();
    expect(dataProtectionLabel).not.toContain("<Link");

    const expectedCopy = {
      de: {
        dataProtectionConsent:
          "Ich bestätige, dass ich die Informationen zum Datenschutz gelesen habe und in die Verarbeitung meiner personenbezogenen Daten zur Erstellung und Verwaltung meines Profils einwillige.",
        programmeParticipationConsent:
          "Ich bestätige, dass die Angaben, die ich in meinem Profil mache, im Rahmen der Programme und Aktivitäten von Res Publica und entsprechend den bereitgestellten Erläuterungen verwendet werden dürfen.",
      },
      en: {
        dataProtectionConsent:
          "I confirm that I have read the data protection information and consent to the processing of my personal data for creating and managing my profile.",
        programmeParticipationConsent:
          "I confirm that the information I provide in my profile may be used within Res Publica programmes and activities, as described in the information provided.",
      },
      fa: {
        dataProtectionConsent:
          "تأیید می‌کنم که اطلاعات مربوط به حفاظت از داده‌ها را مطالعه کرده‌ام و با پردازش داده‌های شخصی‌ام برای ایجاد و مدیریت پروفایل موافقم.",
        programmeParticipationConsent:
          "تأیید می‌کنم که اطلاعاتی که در پروفایل ارائه می‌دهم، در چارچوب برنامه‌ها و فعالیت‌های Res Publica و مطابق توضیحات ارائه‌شده استفاده شود.",
      },
    } as const;

    for (const locale of locales) {
      const dictionary = JSON.parse(
        source("src", "i18n", "dictionaries", `${locale}.json`)
      );
      expect(dictionary.platform.membership.dataProtectionConsent).toBe(
        expectedCopy[locale].dataProtectionConsent
      );
      expect(dictionary.platform.membership.programmeParticipationConsent).toBe(
        expectedCopy[locale].programmeParticipationConsent
      );
      expect(dictionary.platform.membership.dataProtectionConsentRequired).toBeTruthy();
      expect(dictionary.platform.membership.programmeParticipationConsentRequired).toBeTruthy();
    }
  });

  it("requires explicit privacy consent in every data-entry form", () => {
    const formFiles = [
      source("src", "components", "platform", "MembershipForm.tsx"),
      source("src", "components", "platform", "EventRegistration.tsx"),
      source("src", "components", "site", "NewsletterSignup.tsx"),
    ];
    for (const form of formFiles) {
      expect(form).toContain('type="checkbox"');
      expect(form).toContain("consent");
    }
    for (const locale of locales) {
      const dictionary = JSON.parse(
        source("src", "i18n", "dictionaries", `${locale}.json`)
      );
      expect(dictionary.platform.membership.dataProtectionConsent).toBeTruthy();
      expect(
        dictionary.platform.membership.programmeParticipationConsent
      ).toBeTruthy();
      expect(dictionary.platform.eventRegistration.consent).toBeTruthy();
      expect(dictionary.newsletter.consent).toBeTruthy();
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
