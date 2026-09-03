import type { Locale } from "@/i18n/config";

/** Only identities explicitly approved for public display belong here. */

export type TeamMember = {
  id: string;
  name: string;
  image?: string;
  role: Record<Locale, string>;
  bio?: Record<Locale, string>;
};

/**
 * Public identities are limited to the current legal-site disclosure approved
 * by the owner. The signed Satzung defines collective Vorstand authority but
 * does not assign its three statutory offices to individual signatories. The
 * individual titles and professional descriptions below were explicitly
 * approved by the owner on 2026-09-03 and are not inferred from the Satzung.
 */
export const team: TeamMember[] = [
  {
    id: "atie-kashef",
    name: "Dr. Atie Kashef",
    image: "/team/atie-kashef-v3.webp",
    role: {
      de: "Vizepräsidentin · Vorstand",
      en: "Vice President · Board",
      fa: "نایب‌رئیس · هیئت‌مدیره",
    },
    bio: {
      de: "High-Tech Community Designerin und Social Capacity Builderin.",
      en: "High-Tech Community Designer and Social Capacity Builder.",
      fa: "طراح جوامع فناوری پیشرفته و توسعه‌دهنده ظرفیت اجتماعی.",
    },
  },
  {
    id: "donya-nasiri-zarghani",
    name: "Donya Nasiri Zarghani",
    image: "/team/donya-nasiri-zarghani-v3.webp",
    role: {
      de: "Community-Hauptrepräsentantin · Vorstand",
      en: "Principal Community Representative · Board",
      fa: "نماینده اصلی جامعه · هیئت‌مدیره",
    },
    bio: {
      de: "Real-Time Community Operatorin und Mathematikerin.",
      en: "Real-Time Community Operator and Mathematician.",
      fa: "راهبر بلادرنگ جامعه و ریاضی‌دان.",
    },
  },
  {
    id: "jolan-farhadi-babadi",
    name: "Jolan Farhadi Babadi",
    image: "/team/jolan-farhadi-babadi-v3.webp",
    role: {
      de: "Vorstand · Geschäftsführer",
      en: "Board · Managing Director",
      fa: "هیئت‌مدیره · مدیرعامل",
    },
    bio: {
      de: "Governance- und Systemdesigner · M.A. in Praktischer Philosophie und Organisationsdesign.",
      en: "Governance and Systems Designer · M.A. in Practical Philosophy and Organizational Design.",
      fa: "طراح حکمرانی و سیستم‌ها · کارشناسی ارشد فلسفه عملی و طراحی سازمانی.",
    },
  },
];

export const teamSectionCopy: Record<
  Locale,
  {
    title: string;
    lede: string;
    responsibilityTitle: string;
    responsibilities: readonly string[];
    source: string;
  }
> = {
  de: {
    title: "Team und Verantwortung",
    lede:
      "Drei öffentlich bestätigte Personen tragen operative und institutionelle Verantwortung für Res Publica.",
    responsibilityTitle: "Verantwortung des Vorstands laut Satzung",
    responsibilities: [
      "Der Vorstand vertritt den Verein gerichtlich und außergerichtlich; jeweils zwei Vorstandsmitglieder vertreten ihn gemeinsam.",
      "Der Vorstand entscheidet über Mitgliedschaftsanträge sowie über Ausschluss oder Streichung nach den Regeln der Satzung.",
      "Er beruft die Mitgliederversammlung ein und kann zur Unterstützung der operativen Tätigkeit eine Geschäftsführung bestellen.",
    ],
    source: "Öffentliche Satzung als Word-Datei öffnen",
  },
  en: {
    title: "Team and responsibility",
    lede:
      "Three publicly confirmed people carry operational and institutional responsibility for Res Publica.",
    responsibilityTitle: "Board responsibilities under the Statutes",
    responsibilities: [
      "The Board represents the association in and out of court; two Board members jointly represent it.",
      "The Board decides membership applications and decisions on exclusion or removal under the Statutes.",
      "It convenes the General Assembly and may appoint an Executive Management function to support operations.",
    ],
    source: "Open the public Statutes as a Word document",
  },
  fa: {
    title: "تیم و مسئولیت",
    lede:
      "سه فردی که هویت عمومی‌شان تأیید شده است، مسئولیت عملیاتی و نهادی رس پوبلیکا را بر عهده دارند.",
    responsibilityTitle: "مسئولیت‌های هیئت‌مدیره بر پایه اساسنامه",
    responsibilities: [
      "هیئت‌مدیره نماینده انجمن در امور قضایی و غیرقضایی است و هر دو عضو هیئت‌مدیره به‌طور مشترک نمایندگی می‌کنند.",
      "هیئت‌مدیره درباره درخواست‌های عضویت و نیز حذف یا اخراج عضو مطابق اساسنامه تصمیم می‌گیرد.",
      "هیئت‌مدیره مجمع عمومی را دعوت می‌کند و می‌تواند برای پشتیبانی از امور اجرایی، مدیر اجرایی منصوب کند.",
    ],
    source: "باز کردن نسخه عمومی اساسنامه در قالب Word",
  },
};
