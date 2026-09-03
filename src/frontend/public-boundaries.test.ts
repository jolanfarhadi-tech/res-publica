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

  it("publishes only the three approved institutional team identities", () => {
    expect(team).toHaveLength(3);
    expect(team.map((member) => member.name)).toEqual([
      "Atie Kashef",
      "Donya Nasiri Zarghani",
      "Jolan Farhadi Babadi",
    ]);
    const managingDirector = team.find(
      (member) => member.name === "Jolan Farhadi Babadi"
    );
    expect(managingDirector?.role).toEqual({
      de: "Vorstand · Geschäftsführer",
      en: "Board · Geschäftsführer",
      fa: "هیئت‌مدیره · Geschäftsführer",
    });
    expect(team.map((member) => member.image)).toEqual([
      "/team/atie-kashef-v3.webp",
      "/team/donya-nasiri-zarghani-v3.webp",
      "/team/jolan-farhadi-babadi-v3.webp",
    ]);
    for (const member of team) {
      expect(member.image).toBeTruthy();
      expect(
        fs.existsSync(path.join(process.cwd(), "public", member.image!.slice(1)))
      ).toBe(true);
    }
    expect(managingDirector?.bio).toBeUndefined();
    expect(partners).toEqual([]);
  });

  it("publishes only the name-free Word reading copy of the Statutes", () => {
    const publicDocuments = path.join(process.cwd(), "public", "documents");
    expect(
      fs.existsSync(path.join(publicDocuments, "satzung-res-publica-ev.docx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(publicDocuments, "satzung-res-publica-ev-signed.pdf"))
    ).toBe(false);

    const publicReferences = [
      source("src", "components", "platform", "MembershipForm.tsx"),
      source("src", "components", "site", "TeamSection.tsx"),
      source("src", "i18n", "membership-application.ts"),
      source("src", "data", "team.ts"),
    ].join("\n");
    expect(publicReferences).toContain("satzung-res-publica-ev.docx");
    expect(publicReferences).not.toContain("satzung-res-publica-ev-signed.pdf");
    expect(publicReferences).not.toMatch(/Unterzeichnete Satzung|signed Statutes|امضاشده/);
  });

  it("places the approved team on About without removing the legacy Team route", () => {
    const about = source("src", "app", "[locale]", "about", "page.tsx");
    expect(about).toContain("<TeamSection");
    expect(
      fs.existsSync(
        path.join(process.cwd(), "src", "app", "[locale]", "team", "page.tsx")
      )
    ).toBe(true);
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

  it("uses the official supplied identity and separates the ecosystem platforms", () => {
    expect(
      fs.existsSync(path.join(process.cwd(), "public", "brand", "res-publica-logo.png"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(process.cwd(), "public", "brand", "res-publica-mark.png"))
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(process.cwd(), "public", "brand", "res-publica-civic-forum-logo-3d-v3.webp")
      )
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(process.cwd(), "public", "brand", "res-publica-amber-polyhedron-v1.webp")
      )
    ).toBe(true);

    const header = source("src", "components", "site", "Header.tsx");
    const footer = source("src", "components", "site", "Footer.tsx");
    const homepage = source("src", "app", "[locale]", "page.tsx");
    expect(header).toContain('/brand/res-publica-logo.png');
    expect(header).toContain('/brand/res-publica-mark.png');
    expect(footer).toContain('/brand/res-publica-logo.png');
    expect(homepage).toContain('/brand/res-publica-civic-forum-logo-3d-v3.webp');
    expect(homepage).toContain('/brand/res-publica-amber-polyhedron-v1.webp');
    expect(homepage).toContain('/brand/res-publica-logo.png');
    expect(homepage).toContain("copy.snapshot.items");
    expect(homepage).toContain("copy.ecosystem.platforms");
    expect(homepage).toContain("forum-hero__image");
    expect(homepage).toContain("forum-signal__crystal");
    expect(homepage).not.toContain("forum-signal__star");
    expect(homepage).toContain("ecosystem-map__network");
    expect(homepage).toContain("ecosystem-map__core");
    expect(homepage).not.toContain("ecosystem-map__mark");
    expect(homepage).toContain("portal-card__icon");
    const globalCss = source("src", "app", "globals.css");
    expect(globalCss).toContain("perspective: 1400px");
    expect(globalCss).toContain("@keyframes forum-signal-float");
    expect(globalCss).toContain("@keyframes forum-signal-turn");
    expect(globalCss).toContain("@keyframes ecosystem-route-flow");
    expect(globalCss).toContain("@keyframes ecosystem-map-sheen");
    expect(globalCss).toContain("prefers-reduced-motion: reduce");

    for (const locale of locales) {
      const ecosystem = publicSiteCopy[locale].home.ecosystem;
      expect(ecosystem.platforms.map((platform) => platform.name)).toEqual([
        "Civic Platform",
        "HARM Platform",
        "Governance Platform",
        "Shared Platform Services",
      ]);
      expect(ecosystem.platforms.at(-1)?.href).toBeNull();
      expect(ecosystem.principles).toHaveLength(6);
    }

    expect(homepage).not.toMatch(/Projects\s*24|Publications\s*56|Partners\s*45/);
    expect(homepage).not.toMatch(/Arash Abedi|Amnesia|The Fear of Truth/);

    expect(publicSiteCopy.de.home.snapshot.items.map(([value]) => value)).toEqual([
      "10", "4", "3", "5", "4", "2", "2", "5", "5",
    ]);
    expect(publicSiteCopy.en.home.snapshot.items.map(([value]) => value)).toEqual([
      "10", "4", "3", "5", "4", "2", "2", "5", "5",
    ]);
    expect(publicSiteCopy.fa.home.snapshot.items.map(([value]) => value)).toEqual([
      "۱۰", "۴", "۳", "۵", "۴", "۲", "۲", "۵", "۵",
    ]);
  });

  it("keeps the primary navigation concise and localized", () => {
    for (const locale of locales) {
      const items = publicNavigation(locale);
      expect(items).toHaveLength(7);
      expect(items.map((item) => item.href)).toEqual([
        `/${locale}/about`,
        `/${locale}/method`,
        `/${locale}/projects`,
        `/${locale}/programs`,
        `/${locale}/research`,
        `/${locale}/publications`,
        `/${locale}/membership`,
      ]);
      expect(items.map((item) => item.href)).not.toContain(
        `/${locale}/academy`
      );
      expect(items.map((item) => item.href)).not.toContain(
        `/${locale}/products`
      );
      expect(items.map((item) => item.href)).not.toContain(
        `/${locale}/services`
      );
      expect(items.map((item) => item.href)).not.toContain(`/${locale}/offerings`);
      expect(items[0]?.label).toBe(publicSiteCopy[locale].nav.about);
    }
  });

  it("presents the implemented Academy and Fellowship as programmes", () => {
    expect(publicOfferings.find((offering) => offering.id === "academy")).toMatchObject({
      category: "programs",
      maturity: "available",
      operational: true,
    });
    expect(publicOfferings.find((offering) => offering.id === "fellowship")).toMatchObject({
      category: "programs",
    });
  });

  it("keeps the HARM Platform, Operating System and Research Project distinct", () => {
    const methodPage = source("src", "app", "[locale]", "method", "page.tsx");
    expect(methodPage).toContain('aria-labelledby="harm-platform"');
    expect(methodPage).toContain("copy.platformDistinctions");

    for (const locale of locales) {
      const method = publicSiteCopy[locale].method;
      expect(method.platformTitle).toContain("HARM");
      expect(method.platformIntro).toBeTruthy();
      expect(method.platformStatus).toBeTruthy();
      expect(method.platformDistinctions.map(([term]) => term)).toEqual([
        "HARM Operating System",
        "HARM Platform",
        "HARM Research Project",
      ]);

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

  it("presents Civic School through the implemented Academy programme, never as a Project", () => {
    const academy = publicOfferings.find((offering) => offering.id === "academy");
    expect(academy).toMatchObject({
      category: "programs",
      maturity: "available",
      operational: true,
      href: "/academy",
    });
    expect(academy?.title.en).toContain("Civic School");
    expect(publicOfferings.some((offering) => offering.id === "rpcs")).toBe(false);
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
      'className="icon-button inline-grid min-[90rem]:hidden"'
    );
    expect(mobileMenu).toContain("<AccountControl");
    expect(mobileMenu).toContain('window.matchMedia("(min-width: 90rem)")');
    expect(header.match(/hidden min-\[90rem\]:block/g)).toHaveLength(3);
    expect(activeLink).toContain("usePathname()");
    expect(css).not.toMatch(
      /\.icon-button\s*\{[\s\S]*?display:\s*inline-grid/
    );
    expect(css).toContain("overflow-wrap: anywhere");
    expect(css).toContain("hyphens: auto");
  });

  it("uses document navigation for authentication API links", () => {
    const button = source("src", "components", "ui", "Button.tsx");
    expect(button).toContain('href.startsWith("/api/")');
    expect(button).toContain("<a href={href}");
  });

  it("renders the two human and institutional paths inside the visual homepage architecture", () => {
    const homepage = source("src", "app", "[locale]", "page.tsx");
    expect(homepage).toContain("copy.journey.human");
    expect(homepage).toContain("copy.journey.institutional");
    expect(homepage).toContain("copy.gateways.items");
    expect(homepage).toContain("copy.featured.ecosystemTitle");
    expect(homepage).toContain("<CollectionPreview");
    expect(homepage).not.toContain('getEntries(locale, "research")');
  });

  it("keeps programme and collection-card heading levels structurally valid", () => {
    const card = source("src", "components", "ui", "Card.tsx");
    const entryCard = source("src", "components", "ui", "EntryCard.tsx");
    const academy = source("src", "app", "[locale]", "academy", "page.tsx");
    const fellowship = source("src", "app", "[locale]", "fellowship", "page.tsx");
    expect(card).toContain("headingLevel");
    expect(entryCard).toContain("<h2");
    expect(academy).toContain("headingLevel={2}");
    expect(fellowship.match(/headingLevel=\{2\}/g)).toHaveLength(2);
  });

  it("classifies Academy inside Programmes rather than as a parallel top-level category", () => {
    const academy = publicOfferings.find((offering) => offering.id === "academy");
    expect(academy).toMatchObject({
      category: "programs",
      maturity: "available",
      href: "/academy",
    });
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
    expect(membership).toContain("copy.privacyLink");
    for (const form of [event, newsletter]) {
      expect(form).toContain("dict.footer.privacy");
    }
    for (const form of [membership, event, newsletter]) {
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

  it("requires separate default-off application acknowledgements before submission", () => {
    const membership = source(
      "src",
      "components",
      "platform",
      "MembershipForm.tsx"
    );
    expect(membership).toContain("const [statutes, setStatutes] = useState(false)");
    expect(membership).toContain("const [protocol, setProtocol] = useState(false)");
    expect(membership).toContain("const [privacy, setPrivacy] = useState(false)");
    expect(membership).toContain(
      "const ready = statutes && protocol && privacy"
    );
    expect(membership).toContain('href={`/${locale}/datenschutz`}');
    const privacyConfirmation = membership.match(
      /<Confirmation id="privacy-ack"[\s\S]*?<\/Confirmation>/
    )?.[0];
    expect(privacyConfirmation).toBeTruthy();
    expect(privacyConfirmation).toContain("<Link");
    expect(membership).toContain("researchReadiness");
    expect(membership).not.toContain("!researchReadiness");

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

  it("requires explicit privacy acknowledgement or consent in every data-entry form", () => {
    const formFiles = [
      source("src", "components", "platform", "MembershipForm.tsx"),
      source("src", "components", "platform", "EventRegistration.tsx"),
      source("src", "components", "site", "NewsletterSignup.tsx"),
    ];
    for (const form of formFiles.slice(1)) {
      expect(form).toContain('type="checkbox"');
      expect(form).toContain("consent");
    }
    expect(formFiles[0]).toContain('type="checkbox"');
    expect(formFiles[0]).toContain("privacyNotice");
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
