import type { MembershipStatus, MembershipTier } from "../modules/membership/types";

export const germanMemberProfileCopy = {
  title: "Mein Mitgliedschaftsprofil",
  lede: "Hier sehen Sie den aktuellen Stand Ihrer Mitgliedschaft und die nächsten möglichen Statusschritte.",
  loading: "Mitgliedschaftsprofil wird geladen …",
  loginTitle: "Bitte melden Sie sich an",
  loginText: "Ihr Mitgliedschaftsprofil ist ausschließlich über Ihr verifiziertes Konto erreichbar.",
  loginAction: "Anmelden und Profil öffnen",
  unavailableTitle: "Profil derzeit nicht erreichbar",
  unavailableText: "Ihre Daten wurden nicht verändert. Bitte versuchen Sie es später erneut.",
  errorTitle: "Profil konnte nicht geladen werden",
  errorText: "Bitte laden Sie die Seite erneut oder versuchen Sie es später noch einmal.",
  notEnrolledTitle: "Noch keine Mitgliedschaft vorhanden",
  notEnrolledText: "Für Ihr Konto wurde noch keine Mitgliedschaft angelegt.",
  membershipAction: "Mitgliedschaft auswählen",
  applicationHistoryTitle: "Mein Mitgliedschaftsantrag",
  applicationStatusLabel: "Antragsstatus",
  applicationSubmittedAtLabel: "Eingereicht am",
  applicationDecidedAtLabel: "Entschieden am",
  applicationStatusText: "Hier sehen Sie den dokumentierten Stand Ihres eigenen Antrags. Interne Prüfnotizen und Beratungen des Vorstands bleiben geschützt.",
  dashboardAction: "Zum privaten Dashboard",
  overviewTitle: "Mitgliedschaft im Überblick",
  typeLabel: "Mitgliedschaftsform",
  currentStatusLabel: "Aktueller Status",
  registeredAtLabel: "Registriert am",
  journeyTitle: "Mitgliedschaftsverlauf",
  previousStatusLabel: "Vorheriger Status",
  statusChangeDateLabel: "Letzte Statusänderung",
  triggeringActivityLabel: "Grundlage der Statusänderung",
  triggeringActivityValue: "Durch den zuständigen Mitgliedschaftsprozess bestätigt",
  noPreviousStatus: "Noch keine vorherige Statusstufe",
  nextStatusesTitle: "Mögliche nächste Statusschritte",
  noNextStatuses: "Für den aktuellen Status sind keine weiteren Statusschritte vorgesehen.",
  privacyNotice: "Diese Ansicht zeigt ausschließlich Angaben zu Ihrer eigenen Mitgliedschaft. Interne Prüf- und Governance-Informationen werden hier nicht angezeigt.",
  profileLink: "Mein Profil",
} as const;

export const germanMembershipStatusLabels: Record<MembershipStatus, string> = {
  registered: "Registriert",
  verified: "Verifiziert",
  active: "Aktiv",
  inactive: "Inaktiv",
  paused: "Pausiert",
  "self-isolated": "Selbstisoliert",
  withdrawn: "Ausgetreten",
  retired: "Im Ruhestand",
  suspended: "Suspendiert",
  terminated: "Beendet",
};

export const germanMembershipTierLabels: Record<MembershipTier, string> = {
  basic: "Ordentliche Mitgliedschaft",
  supporter: "Fördermitgliedschaft",
  volunteer: "Ehrenamtliche Mitwirkung",
  research: "Forschungsbezogene Mitwirkung",
  institutional: "Institutionelle Mitwirkung",
};

export type MemberProfileCopy = { [Key in keyof typeof germanMemberProfileCopy]: string };

export const englishMemberProfileCopy: MemberProfileCopy = {
  title: "My membership profile",
  lede: "See your current membership status and the next status steps available to you.",
  loading: "Loading membership profile …",
  loginTitle: "Please sign in",
  loginText: "Your membership profile is available only through your verified account.",
  loginAction: "Sign in and open profile",
  unavailableTitle: "Profile currently unavailable",
  unavailableText: "Your data has not been changed. Please try again later.",
  errorTitle: "Profile could not be loaded",
  errorText: "Please reload the page or try again later.",
  notEnrolledTitle: "No membership yet",
  notEnrolledText: "No membership has been created for your account yet.",
  membershipAction: "Choose a membership",
  applicationHistoryTitle: "My membership application",
  applicationStatusLabel: "Application status",
  applicationSubmittedAtLabel: "Submitted on",
  applicationDecidedAtLabel: "Decided on",
  applicationStatusText: "This is the documented status of your own application. Internal review notes and board deliberations remain protected.",
  dashboardAction: "Open private dashboard",
  overviewTitle: "Membership overview",
  typeLabel: "Membership type",
  currentStatusLabel: "Current status",
  registeredAtLabel: "Registration date",
  journeyTitle: "Membership journey",
  previousStatusLabel: "Previous status",
  statusChangeDateLabel: "Most recent status change",
  triggeringActivityLabel: "Basis for the status change",
  triggeringActivityValue: "Confirmed through the responsible membership process",
  noPreviousStatus: "No previous status step yet",
  nextStatusesTitle: "Possible next status steps",
  noNextStatuses: "No further status steps are defined for the current status.",
  privacyNotice: "This view shows information about your own membership only. Internal review and governance information is not displayed here.",
  profileLink: "My profile",
};

export const englishMembershipStatusLabels: Record<MembershipStatus, string> = {
  registered: "Registered",
  verified: "Verified",
  active: "Active",
  inactive: "Inactive",
  paused: "Paused",
  "self-isolated": "Self-isolated",
  withdrawn: "Withdrawn",
  retired: "Retired",
  suspended: "Suspended",
  terminated: "Terminated",
};

export const englishMembershipTierLabels: Record<MembershipTier, string> = {
  basic: "Ordinary membership",
  supporter: "Supporting membership",
  volunteer: "Volunteer participation",
  research: "Research participation",
  institutional: "Institutional participation",
};

export const persianMemberProfileCopy: MemberProfileCopy = {
  title: "پروفایل عضویت من",
  lede: "در این صفحه، وضعیت کنونی عضویت و گام‌های احتمالی بعدی را مشاهده می‌کنید.",
  loading: "پروفایل عضویت در حال بارگذاری است …",
  loginTitle: "لطفاً وارد حساب خود شوید",
  loginText: "پروفایل عضویت شما فقط از طریق حساب تأییدشده‌تان در دسترس است.",
  loginAction: "ورود و مشاهدهٔ پروفایل",
  unavailableTitle: "پروفایل در حال حاضر در دسترس نیست",
  unavailableText: "داده‌های شما تغییری نکرده است. لطفاً بعداً دوباره تلاش کنید.",
  errorTitle: "بارگذاری پروفایل ممکن نشد",
  errorText: "لطفاً صفحه را دوباره بارگذاری کنید یا کمی بعد دوباره تلاش کنید.",
  notEnrolledTitle: "هنوز عضویتی ثبت نشده است",
  notEnrolledText: "هنوز برای حساب شما عضویتی ایجاد نشده است.",
  membershipAction: "انتخاب نوع عضویت",
  applicationHistoryTitle: "درخواست عضویت من",
  applicationStatusLabel: "وضعیت درخواست",
  applicationSubmittedAtLabel: "تاریخ ارسال",
  applicationDecidedAtLabel: "تاریخ تصمیم",
  applicationStatusText: "در اینجا وضعیت مستند درخواست خود را می‌بینید. یادداشت‌های داخلی بررسی و مشورت‌های هیئت‌مدیره محفوظ می‌ماند.",
  dashboardAction: "رفتن به داشبورد خصوصی",
  overviewTitle: "نمای کلی عضویت",
  typeLabel: "نوع عضویت",
  currentStatusLabel: "وضعیت کنونی",
  registeredAtLabel: "تاریخ ثبت‌نام",
  journeyTitle: "مسیر عضویت",
  previousStatusLabel: "وضعیت پیشین",
  statusChangeDateLabel: "آخرین تغییر وضعیت",
  triggeringActivityLabel: "مبنای تغییر وضعیت",
  triggeringActivityValue: "از طریق فرایند مسئول عضویت تأیید شده است",
  noPreviousStatus: "هنوز وضعیت پیشینی وجود ندارد",
  nextStatusesTitle: "گام‌های احتمالی بعدی",
  noNextStatuses: "برای وضعیت کنونی، گام دیگری تعریف نشده است.",
  privacyNotice: "این بخش فقط اطلاعات مربوط به عضویت خود شما را نمایش می‌دهد. اطلاعات داخلی بررسی و حکمرانی در اینجا نمایش داده نمی‌شود.",
  profileLink: "پروفایل من",
};

export const persianMembershipStatusLabels: Record<MembershipStatus, string> = {
  registered: "ثبت‌شده",
  verified: "تأییدشده",
  active: "فعال",
  inactive: "غیرفعال",
  paused: "در حالت وقفه",
  "self-isolated": "خودکناره‌گرفته",
  withdrawn: "انصراف‌داده",
  retired: "بازنشسته",
  suspended: "تعلیق‌شده",
  terminated: "خاتمه‌یافته",
};

export const persianMembershipTierLabels: Record<MembershipTier, string> = {
  basic: "عضویت عادی",
  supporter: "عضویت حامی",
  volunteer: "مشارکت داوطلبانه",
  research: "مشارکت پژوهشی",
  institutional: "مشارکت نهادی",
};

export const memberProfileCopy = {
  de: germanMemberProfileCopy,
  en: englishMemberProfileCopy,
  fa: persianMemberProfileCopy,
} as const;

export const membershipStatusLabels = {
  de: germanMembershipStatusLabels,
  en: englishMembershipStatusLabels,
  fa: persianMembershipStatusLabels,
} as const;

export const membershipTierLabels = {
  de: germanMembershipTierLabels,
  en: englishMembershipTierLabels,
  fa: persianMembershipTierLabels,
} as const;

export type MemberProfileLocale = keyof typeof memberProfileCopy;

export function isMemberProfileLocale(locale: string): locale is MemberProfileLocale {
  return locale === "de" || locale === "en" || locale === "fa";
}
