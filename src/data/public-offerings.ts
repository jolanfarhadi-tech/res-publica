import type { Locale } from "@/i18n/config";

export type OfferingMaturity =
  | "available"
  | "partial"
  | "documented";

export type PublicCategory = "programs" | "products" | "services";

export type PublicOffering = {
  id: string;
  category: PublicCategory;
  maturity: OfferingMaturity;
  href?: `/${string}`;
  operational: boolean;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

/**
 * Public-facing capabilities only. Internal infrastructure, governance
 * machinery and the AI/EAO layers are intentionally absent.
 */
export const publicOfferings: readonly PublicOffering[] = [
  {
    id: "website",
    category: "products",
    maturity: "available",
    href: "/",
    operational: true,
    title: {
      de: "Mehrsprachige öffentliche Website",
      en: "Multilingual public website",
      fa: "وب‌سایت عمومی چندزبانه",
    },
    description: {
      de: "Öffentliche Orientierung in Deutsch, Englisch und Persisch mit RTL-Unterstützung.",
      en: "Public orientation in German, English and Persian, including RTL support.",
      fa: "راهنمایی عمومی به زبان‌های آلمانی، انگلیسی و فارسی، با پشتیبانی راست‌به‌چپ.",
    },
  },
  {
    id: "search",
    category: "products",
    maturity: "available",
    href: "/search",
    operational: true,
    title: {
      de: "Suche in veröffentlichten Inhalten",
      en: "Published-content search",
      fa: "جست‌وجو در محتوای منتشرشده",
    },
    description: {
      de: "Eine lokale Suche über tatsächlich veröffentlichte Seiten und Beiträge.",
      en: "A local search across pages and entries that are actually published.",
      fa: "جست‌وجویی محلی در صفحه‌ها و مطالبی که واقعاً منتشر شده‌اند.",
    },
  },
  {
    id: "membership",
    category: "services",
    maturity: "available",
    href: "/membership",
    operational: true,
    title: {
      de: "Mitgliedschaftsantrag",
      en: "Membership application",
      fa: "درخواست عضویت",
    },
    description: {
      de: "Ein geschützter Einstieg in langfristige zivilgesellschaftliche Beteiligung.",
      en: "A protected entry point into sustained civic participation.",
      fa: "درگاهی حفاظت‌شده برای ورود به مشارکت مدنی پایدار.",
    },
  },
  {
    id: "profile",
    category: "products",
    maturity: "available",
    href: "/profile",
    operational: true,
    title: {
      de: "Geschütztes Mitgliedsprofil",
      en: "Protected Member Profile",
      fa: "پروفایل حفاظت‌شده عضو",
    },
    description: {
      de: "Angemeldete Personen sehen ausschließlich ihren eigenen Mitgliedschaftsstatus, Änderungen und mögliche nächste Zustände.",
      en: "Signed-in people see only their own membership status, changes and possible next states.",
      fa: "افراد واردشده فقط وضعیت عضویت خود، تغییرات و حالت‌های بعدی ممکن را می‌بینند.",
    },
  },
  {
    id: "events",
    category: "services",
    maturity: "partial",
    href: "/events",
    operational: true,
    title: {
      de: "Veranstaltungen und Anmeldung",
      en: "Events and registration",
      fa: "رویدادها و ثبت‌نام",
    },
    description: {
      de: "Die Anmeldemechanik ist vorhanden; öffentliche Termine erscheinen erst nach Quellenprüfung.",
      en: "Registration mechanics exist; public dates appear only after source review.",
      fa: "سازوکار ثبت‌نام موجود است؛ تاریخ‌های عمومی فقط پس از بررسی منبع نمایش داده می‌شوند.",
    },
  },
  {
    id: "contact",
    category: "services",
    maturity: "available",
    href: "/contact",
    operational: true,
    title: {
      de: "Direkter Kontakt",
      en: "Direct contact",
      fa: "تماس مستقیم",
    },
    description: {
      de: "Kontakt per E-Mail an die in der Datenschutzerklärung bestätigte Vereinsadresse.",
      en: "Email contact through the association address confirmed in the privacy notice.",
      fa: "تماس ایمیلی از طریق نشانی انجمن که در اطلاعیه حریم خصوصی تأیید شده است.",
    },
  },
  {
    id: "fellowship",
    category: "programs",
    maturity: "documented",
    operational: false,
    title: {
      de: "Civic Fellowship",
      en: "Civic Fellowship",
      fa: "همراهی مدنی",
    },
    description: {
      de: "Ein dokumentiertes Modell für dauerhafte Zugehörigkeit, gegenseitiges Lernen und gemeinsame institutionelle Praxis.",
      en: "A documented model for sustained belonging, mutual learning and shared institutional practice.",
      fa: "الگویی مستند برای تعلق پایدار، یادگیری متقابل و کنش نهادی مشترک.",
    },
  },
  {
    id: "rpcs",
    category: "programs",
    maturity: "documented",
    operational: false,
    title: {
      de: "RPCS / Civic School",
      en: "RPCS / Civic School",
      fa: "RPCS / مدرسه مدنی",
    },
    description: {
      de: "Ein dokumentiertes Bildungsprogramm; derzeit kein öffentlich gestartetes Kursangebot.",
      en: "A documented education programme; not currently presented as a launched public course.",
      fa: "برنامه‌ای آموزشی و مستند؛ در حال حاضر به‌عنوان دوره عمومی آغازشده معرفی نمی‌شود.",
    },
  },
] as const;

export function offeringsForLocale(locale: Locale) {
  return publicOfferings.map((offering) => ({
    ...offering,
    title: offering.title[locale],
    description: offering.description[locale],
  }));
}

export function offeringsForCategory(
  locale: Locale,
  category: PublicCategory
) {
  return offeringsForLocale(locale).filter(
    (offering) => offering.category === category
  );
}

export function hasOperationalCallToAction(
  offering: Pick<PublicOffering, "operational" | "href">
): boolean {
  return offering.operational && Boolean(offering.href);
}
