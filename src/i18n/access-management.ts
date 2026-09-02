import type { Locale } from "./config";

export const governanceDelegableRoles = [
  "intake-moderator",
  "validation-officer",
  "evidence-reviewer",
  "hearing-moderator",
  "quality-reviewer",
  "scientific-reviewer",
  "repair-coordinator",
] as const;
export const publishingDelegableRoles = ["editor", "reviewer", "translator"] as const;

type AccessManagementCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  governanceTitle: string;
  publishingTitle: string;
  scope: string;
  granteePersonId: string;
  granteeHelp: string;
  role: string;
  validUntil: string;
  optional: string;
  grant: string;
  granting: string;
  activeDelegations: string;
  noDelegations: string;
  revoke: string;
  revoking: string;
  success: string;
  error: string;
  recentMfaRequired: string;
  refreshMfa: string;
  foundationalBoundary: string;
  roles: Record<
    (typeof governanceDelegableRoles)[number] | (typeof publishingDelegableRoles)[number],
    string
  >;
};

const de: AccessManagementCopy = {
  eyebrow: "Begrenzte Zugriffsverwaltung",
  title: "Rollen und Zuständigkeiten",
  lede: "Institution Admins und Publisher können ausschließlich die operativen Rollen innerhalb ihrer eigenen, exakten Zuständigkeit vergeben oder widerrufen.",
  governanceTitle: "Governance-Rollen",
  publishingTitle: "Publishing-Rollen",
  scope: "Exakter Zuständigkeitsbereich",
  granteePersonId: "Interne Personen-ID der beauftragten Person",
  granteeHelp: "Verwenden Sie nur die Personen-ID aus einem freigegebenen Provisionierungsantrag. E-Mail-Adressen oder Auth0-Claims verleihen keine Rechte.",
  role: "Operative Rolle",
  validUntil: "Gültig bis",
  optional: "Optional",
  grant: "Rolle vergeben",
  granting: "Rolle wird vergeben …",
  activeDelegations: "Aktive Delegationen",
  noDelegations: "Für diese Zuständigkeiten bestehen keine aktiven operativen Delegationen.",
  revoke: "Widerrufen",
  revoking: "Widerruf läuft …",
  success: "Die Änderung wurde zusammen mit dem kanonischen Auditnachweis gespeichert.",
  error: "Die Änderung wurde abgewiesen. Es wurde keine erfolgreiche Änderung bestätigt.",
  recentMfaRequired: "Rollenänderungen erfordern eine aktuelle MFA-Bestätigung.",
  refreshMfa: "MFA erneut bestätigen",
  foundationalBoundary: "Institution Admin und Publisher werden ausschließlich durch den extern dokumentierten Founder-/Human-Approval-Prozess bestellt. Sie können hier weder vergeben noch widerrufen werden.",
  roles: {
    "intake-moderator": "Intake Moderator",
    "validation-officer": "Validation Officer",
    "evidence-reviewer": "Evidence Reviewer",
    "hearing-moderator": "Hearing Moderator",
    "quality-reviewer": "Quality Reviewer",
    "scientific-reviewer": "Scientific Reviewer",
    "repair-coordinator": "Repair Coordinator",
    editor: "Editor",
    reviewer: "Reviewer",
    translator: "Translator",
  },
};

const en: AccessManagementCopy = {
  eyebrow: "Bounded access administration",
  title: "Roles and responsibilities",
  lede: "Institution Admins and Publishers may grant or revoke only operational roles within their own exact authority scope.",
  governanceTitle: "Governance roles",
  publishingTitle: "Publishing roles",
  scope: "Exact authority scope",
  granteePersonId: "Internal Person ID of the appointee",
  granteeHelp: "Use only the Person ID from an approved provisioning request. Email addresses and Auth0 claims grant no authority.",
  role: "Operational role",
  validUntil: "Valid until",
  optional: "Optional",
  grant: "Grant role",
  granting: "Granting role …",
  activeDelegations: "Active delegations",
  noDelegations: "There are no active operational delegations in these scopes.",
  revoke: "Revoke",
  revoking: "Revoking …",
  success: "The change and its canonical audit evidence were stored together.",
  error: "The change was rejected. No successful mutation was confirmed.",
  recentMfaRequired: "Role changes require fresh MFA confirmation.",
  refreshMfa: "Confirm MFA again",
  foundationalBoundary: "Institution Admin and Publisher are appointed only through the externally recorded Founder/Human Approval process. They cannot be granted or revoked here.",
  roles: {
    "intake-moderator": "Intake Moderator",
    "validation-officer": "Validation Officer",
    "evidence-reviewer": "Evidence Reviewer",
    "hearing-moderator": "Hearing Moderator",
    "quality-reviewer": "Quality Reviewer",
    "scientific-reviewer": "Scientific Reviewer",
    "repair-coordinator": "Repair Coordinator",
    editor: "Editor",
    reviewer: "Reviewer",
    translator: "Translator",
  },
};

const fa: AccessManagementCopy = {
  eyebrow: "مدیریت محدود دسترسی",
  title: "نقش‌ها و مسئولیت‌ها",
  lede: "مدیران نهادی و مسئولان انتشار فقط می‌توانند نقش‌های عملیاتی را در محدوده دقیق اختیار خود واگذار یا لغو کنند.",
  governanceTitle: "نقش‌های حکمرانی",
  publishingTitle: "نقش‌های انتشار",
  scope: "محدوده دقیق اختیار",
  granteePersonId: "شناسه داخلی شخصِ منصوب‌شونده",
  granteeHelp: "فقط از شناسه شخص در درخواست تأییدشده تأمین دسترسی استفاده کنید. ایمیل یا ادعاهای Auth0 هیچ اختیاری ایجاد نمی‌کنند.",
  role: "نقش عملیاتی",
  validUntil: "معتبر تا",
  optional: "اختیاری",
  grant: "واگذاری نقش",
  granting: "نقش در حال واگذاری است…",
  activeDelegations: "واگذاری‌های فعال",
  noDelegations: "در این محدوده‌ها واگذاری عملیاتی فعالی وجود ندارد.",
  revoke: "لغو",
  revoking: "لغو در حال انجام است…",
  success: "تغییر همراه با سند حسابرسی رسمی به‌صورت یکپارچه ذخیره شد.",
  error: "تغییر رد شد و هیچ تغییر موفقی تأیید نشد.",
  recentMfaRequired: "تغییر نقش به تأیید تازه احراز هویت چندعاملی نیاز دارد.",
  refreshMfa: "تأیید دوباره MFA",
  foundationalBoundary: "نقش مدیر نهادی و مسئول انتشار فقط از طریق فرایند ثبت‌شده بنیان‌گذار/مرجع انسانی تأیید منصوب می‌شود و در اینجا قابل واگذاری یا لغو نیست.",
  roles: {
    "intake-moderator": "مدیر دریافت",
    "validation-officer": "مسئول اعتبارسنجی",
    "evidence-reviewer": "بازبین شواهد",
    "hearing-moderator": "مدیر جلسه استماع",
    "quality-reviewer": "بازبین کیفیت",
    "scientific-reviewer": "بازبین علمی",
    "repair-coordinator": "هماهنگ‌کننده ترمیم",
    editor: "ویراستار",
    reviewer: "بازبین",
    translator: "مترجم",
  },
};

export const accessManagementCopy: Record<Locale, AccessManagementCopy> = {
  de,
  en,
  fa,
};
