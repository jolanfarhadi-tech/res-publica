import type { Locale } from "./config";

export type OperationsCopy = {
  title: string;
  lede: string;
  link: string;
  loading: string;
  loginTitle: string;
  loginText: string;
  loginAction: string;
  mfaTitle: string;
  mfaText: string;
  forbiddenTitle: string;
  forbiddenText: string;
  unavailableTitle: string;
  unavailableText: string;
  errorTitle: string;
  errorText: string;
  assuranceLabel: string;
  exactAuthority: string;
  membershipTitle: string;
  membershipLede: string;
  membershipEmpty: string;
  applicant: string;
  submittedAt: string;
  assignedAt: string;
  requestedTier: string;
  status: string;
  reviewAction: string;
  detailLoading: string;
  detailError: string;
  contactTitle: string;
  addressTitle: string;
  acknowledgementsTitle: string;
  decisionHistoryTitle: string;
  decisionHistoryEmpty: string;
  auditReference: string;
  validUntil: string;
  unlimited: string;
  approve: string;
  reject: string;
  confirmApprove: string;
  confirmReject: string;
  confirmDecision: string;
  cancel: string;
  decisionPending: string;
  decisionSuccess: string;
  decisionError: string;
  decidedBy: string;
  publishingTitle: string;
  publishingLede: string;
  publishingEmpty: string;
  publicationScope: string;
  roles: string;
  workspaceLoading: string;
  workspaceError: string;
  submissions: string;
  drafts: string;
  moderation: string;
  translations: string;
  signOffs: string;
  readiness: string;
  noRecords: string;
  version: string;
  assignedReviewer: string;
  decision: string;
  readyBoundary: string;
  noAutoPublish: string;
  statuses: Record<"application_pending" | "approved" | "rejected" | "withdrawn", string>;
  tiers: Record<"basic" | "supporter" | "volunteer" | "research" | "institutional", string>;
  documents: Record<"statutes" | "technical-protocol" | "privacy-notice", string>;
  rolesMap: Record<"editor" | "reviewer" | "translator" | "publisher", string>;
};

const de: OperationsCopy = {
  title: "Geschützter Arbeitsbereich",
  lede: "Antragsprüfung und redaktionelle Arbeit innerhalb exakt zugewiesener Zuständigkeiten.",
  link: "Arbeitsbereich",
  loading: "Arbeitsbereich wird geladen …",
  loginTitle: "Anmeldung erforderlich",
  loginText: "Dieser Arbeitsbereich ist nur mit einem autorisierten Konto erreichbar.",
  loginAction: "Als befugte Person anmelden",
  mfaTitle: "Mehrstufige Anmeldung erforderlich",
  mfaText: "Ihre Zuständigkeit ist vorhanden, sensible Vorgänge werden jedoch erst nach bestätigter MFA angezeigt.",
  forbiddenTitle: "Keine operative Zuständigkeit",
  forbiddenText: "Für dieses Konto liegt keine aktive, exakt begrenzte Zuständigkeit vor.",
  unavailableTitle: "Arbeitsbereich nicht verfügbar",
  unavailableText: "Es wurden keine Daten verändert. Bitte versuchen Sie es später erneut.",
  errorTitle: "Arbeitsbereich konnte nicht geladen werden",
  errorText: "Bitte laden Sie die Seite neu oder versuchen Sie es später erneut.",
  assuranceLabel: "Sicherheitsstufe",
  exactAuthority: "Exakt begrenzte Zuständigkeit",
  membershipTitle: "Mitgliedschaftsanträge",
  membershipLede: "Es erscheinen nur Anträge, für die diesem Konto eine aktive Entscheidungszuständigkeit zugewiesen wurde.",
  membershipEmpty: "Keine zugewiesenen Mitgliedschaftsanträge vorhanden.",
  applicant: "Antragstellende Person",
  submittedAt: "Eingereicht",
  assignedAt: "Zuständigkeit seit",
  requestedTier: "Beantragte Form",
  status: "Status",
  reviewAction: "Antrag prüfen",
  detailLoading: "Antragsdetails werden geladen …",
  detailError: "Die Antragsdetails konnten nicht geladen werden.",
  contactTitle: "Kontakt",
  addressTitle: "Anschrift",
  acknowledgementsTitle: "Versionierte Bestätigungen",
  decisionHistoryTitle: "Entscheidungsverlauf",
  decisionHistoryEmpty: "Noch keine Entscheidung dokumentiert.",
  auditReference: "Audit-Referenz",
  validUntil: "Zuständigkeit gültig bis",
  unlimited: "ohne festes Enddatum",
  approve: "Antrag bestätigen",
  reject: "Antrag ablehnen",
  confirmApprove: "Mit dieser Entscheidung wird eine verifizierte Mitgliedschaft angelegt. Bitte bestätigen Sie den Vorgang ausdrücklich.",
  confirmReject: "Mit dieser Entscheidung wird der Antrag abgelehnt. Bitte bestätigen Sie den Vorgang ausdrücklich.",
  confirmDecision: "Entscheidung verbindlich speichern",
  cancel: "Abbrechen",
  decisionPending: "Entscheidung wird gespeichert …",
  decisionSuccess: "Die Entscheidung wurde atomar gespeichert.",
  decisionError: "Die Entscheidung konnte nicht gespeichert werden. Es wurde keine erfolgreiche Änderung bestätigt.",
  decidedBy: "Entschieden durch Person-ID",
  publishingTitle: "Publishing Authority",
  publishingLede: "Der vorhandene redaktionelle Arbeitsstand je Publikationsbereich. Bereit bedeutet nicht automatisch veröffentlicht.",
  publishingEmpty: "Keine redaktionelle Zuständigkeit vorhanden.",
  publicationScope: "Publikationsbereich",
  roles: "Rollen",
  workspaceLoading: "Redaktioneller Arbeitsstand wird geladen …",
  workspaceError: "Der redaktionelle Arbeitsstand konnte nicht geladen werden.",
  submissions: "Einreichungen",
  drafts: "Entwürfe",
  moderation: "Moderation",
  translations: "Übersetzungen",
  signOffs: "Freigaben",
  readiness: "Bereitschaftsstände",
  noRecords: "Keine Datensätze in diesem Bereich.",
  version: "Version",
  assignedReviewer: "Zugewiesene Prüfung",
  decision: "Entscheidung",
  readyBoundary: "Bereit zur kontrollierten Veröffentlichung",
  noAutoPublish: "Diese Oberfläche veröffentlicht nicht automatisch und schreibt weder Git-Commits noch öffentliche Inhalte.",
  statuses: {
    application_pending: "Antrag wird geprüft",
    approved: "Mitgliedschaft bestätigt",
    rejected: "Antrag abgelehnt",
    withdrawn: "Antrag zurückgezogen",
  },
  tiers: {
    basic: "Basismitgliedschaft",
    supporter: "Fördermitgliedschaft",
    volunteer: "Aktive Mitwirkung",
    research: "Forschungsbezogene Mitgliedschaft",
    institutional: "Institutionelle Mitgliedschaft",
  },
  documents: {
    statutes: "Satzung",
    "technical-protocol": "Mitgliedschaftsregelungen",
    "privacy-notice": "Datenschutzhinweise",
  },
  rolesMap: {
    editor: "Redaktion",
    reviewer: "Prüfung",
    translator: "Übersetzung",
    publisher: "Publikationsfreigabe",
  },
};

const en: OperationsCopy = {
  title: "Protected workspace",
  lede: "Application review and editorial work within precisely assigned authority.",
  link: "Workspace",
  loading: "Loading workspace …",
  loginTitle: "Sign-in required",
  loginText: "This workspace is available only to an authorized account.",
  loginAction: "Sign in as an authorized person",
  mfaTitle: "Multi-factor authentication required",
  mfaText: "Your assignment exists, but sensitive work is shown only after MFA has been confirmed.",
  forbiddenTitle: "No operational assignment",
  forbiddenText: "This account has no active, precisely bounded operational authority.",
  unavailableTitle: "Workspace unavailable",
  unavailableText: "No data was changed. Please try again later.",
  errorTitle: "Workspace could not be loaded",
  errorText: "Please reload the page or try again later.",
  assuranceLabel: "Security assurance",
  exactAuthority: "Exact bounded authority",
  membershipTitle: "Membership applications",
  membershipLede: "Only applications covered by an active decision assignment for this account are shown.",
  membershipEmpty: "No assigned membership applications.",
  applicant: "Applicant",
  submittedAt: "Submitted",
  assignedAt: "Authority assigned",
  requestedTier: "Requested form",
  status: "Status",
  reviewAction: "Review application",
  detailLoading: "Loading application details …",
  detailError: "The application details could not be loaded.",
  contactTitle: "Contact",
  addressTitle: "Address",
  acknowledgementsTitle: "Versioned acknowledgements",
  decisionHistoryTitle: "Decision history",
  decisionHistoryEmpty: "No decision has been recorded.",
  auditReference: "Audit reference",
  validUntil: "Authority valid until",
  unlimited: "no fixed end date",
  approve: "Approve application",
  reject: "Reject application",
  confirmApprove: "This decision creates a verified membership. Please confirm the action explicitly.",
  confirmReject: "This decision rejects the application. Please confirm the action explicitly.",
  confirmDecision: "Record binding decision",
  cancel: "Cancel",
  decisionPending: "Recording decision …",
  decisionSuccess: "The decision was recorded atomically.",
  decisionError: "The decision could not be recorded. No successful change has been confirmed.",
  decidedBy: "Deciding person ID",
  publishingTitle: "Publishing Authority",
  publishingLede: "The existing editorial state for each publication scope. Ready never means automatically published.",
  publishingEmpty: "No editorial assignment is available.",
  publicationScope: "Publication scope",
  roles: "Roles",
  workspaceLoading: "Loading editorial workspace …",
  workspaceError: "The editorial workspace could not be loaded.",
  submissions: "Submissions",
  drafts: "Drafts",
  moderation: "Moderation",
  translations: "Translations",
  signOffs: "Sign-offs",
  readiness: "Readiness records",
  noRecords: "No records in this scope.",
  version: "Version",
  assignedReviewer: "Assigned reviewer",
  decision: "Decision",
  readyBoundary: "Ready for controlled publication",
  noAutoPublish: "This interface does not auto-publish and writes neither Git commits nor public content.",
  statuses: {
    application_pending: "Application under review",
    approved: "Membership confirmed",
    rejected: "Application rejected",
    withdrawn: "Application withdrawn",
  },
  tiers: {
    basic: "Basic membership",
    supporter: "Supporting membership",
    volunteer: "Active participation",
    research: "Research-related membership",
    institutional: "Institutional membership",
  },
  documents: {
    statutes: "Statutes",
    "technical-protocol": "Membership rules",
    "privacy-notice": "Privacy notice",
  },
  rolesMap: {
    editor: "Editor",
    reviewer: "Reviewer",
    translator: "Translator",
    publisher: "Publisher",
  },
};

const fa: OperationsCopy = {
  title: "محیط کاری حفاظت‌شده",
  lede: "بررسی درخواست‌ها و کار تحریریه در محدودهٔ مسئولیت‌های دقیق و واگذارشده.",
  link: "محیط کاری",
  loading: "محیط کاری در حال بارگذاری است…",
  loginTitle: "ورود لازم است",
  loginText: "این محیط کاری فقط برای حساب مجاز در دسترس است.",
  loginAction: "ورود به‌عنوان فرد مجاز",
  mfaTitle: "احراز هویت چندمرحله‌ای لازم است",
  mfaText: "مسئولیت شما ثبت شده است، اما امور حساس فقط پس از تأیید MFA نمایش داده می‌شوند.",
  forbiddenTitle: "مسئولیت عملیاتی وجود ندارد",
  forbiddenText: "برای این حساب هیچ مسئولیت فعال و دقیقاً محدودشده‌ای ثبت نشده است.",
  unavailableTitle: "محیط کاری در دسترس نیست",
  unavailableText: "هیچ داده‌ای تغییر نکرده است. لطفاً بعداً دوباره تلاش کنید.",
  errorTitle: "بارگذاری محیط کاری ممکن نشد",
  errorText: "لطفاً صفحه را دوباره بارگذاری کنید یا بعداً تلاش کنید.",
  assuranceLabel: "سطح اطمینان امنیتی",
  exactAuthority: "مسئولیت دقیق و محدود",
  membershipTitle: "درخواست‌های عضویت",
  membershipLede: "فقط درخواست‌هایی نمایش داده می‌شوند که مسئولیت تصمیم‌گیری فعال آن‌ها به این حساب واگذار شده است.",
  membershipEmpty: "هیچ درخواست عضویت واگذارشده‌ای وجود ندارد.",
  applicant: "درخواست‌دهنده",
  submittedAt: "زمان ارسال",
  assignedAt: "زمان واگذاری مسئولیت",
  requestedTier: "نوع درخواستی",
  status: "وضعیت",
  reviewAction: "بررسی درخواست",
  detailLoading: "جزئیات درخواست در حال بارگذاری است…",
  detailError: "بارگذاری جزئیات درخواست ممکن نشد.",
  contactTitle: "تماس",
  addressTitle: "نشانی",
  acknowledgementsTitle: "تأییدهای نسخه‌بندی‌شده",
  decisionHistoryTitle: "سابقهٔ تصمیم",
  decisionHistoryEmpty: "هنوز تصمیمی ثبت نشده است.",
  auditReference: "مرجع حسابرسی",
  validUntil: "اعتبار مسئولیت تا",
  unlimited: "بدون تاریخ پایان ثابت",
  approve: "تأیید درخواست",
  reject: "رد درخواست",
  confirmApprove: "این تصمیم یک عضویت تأییدشده ایجاد می‌کند. لطفاً اقدام را صریحاً تأیید کنید.",
  confirmReject: "این تصمیم درخواست را رد می‌کند. لطفاً اقدام را صریحاً تأیید کنید.",
  confirmDecision: "ثبت قطعی تصمیم",
  cancel: "انصراف",
  decisionPending: "تصمیم در حال ثبت است…",
  decisionSuccess: "تصمیم به‌صورت اتمی ثبت شد.",
  decisionError: "ثبت تصمیم ممکن نشد. هیچ تغییر موفقی تأیید نشده است.",
  decidedBy: "شناسهٔ فرد تصمیم‌گیرنده",
  publishingTitle: "مرجع انتشار",
  publishingLede: "وضعیت موجود تحریریه برای هر محدودهٔ انتشار. آماده‌بودن هرگز به معنی انتشار خودکار نیست.",
  publishingEmpty: "هیچ مسئولیت تحریریه‌ای وجود ندارد.",
  publicationScope: "محدودهٔ انتشار",
  roles: "نقش‌ها",
  workspaceLoading: "محیط تحریریه در حال بارگذاری است…",
  workspaceError: "بارگذاری محیط تحریریه ممکن نشد.",
  submissions: "ارسال‌ها",
  drafts: "پیش‌نویس‌ها",
  moderation: "بازبینی",
  translations: "ترجمه‌ها",
  signOffs: "تأییدهای نهایی",
  readiness: "سوابق آمادگی",
  noRecords: "در این محدوده سابقه‌ای وجود ندارد.",
  version: "نسخه",
  assignedReviewer: "بازبین واگذارشده",
  decision: "تصمیم",
  readyBoundary: "آماده برای انتشار کنترل‌شده",
  noAutoPublish: "این رابط انتشار خودکار انجام نمی‌دهد و هیچ محتوای عمومی یا Git commit نمی‌نویسد.",
  statuses: {
    application_pending: "درخواست در حال بررسی است",
    approved: "عضویت تأیید شده است",
    rejected: "درخواست رد شده است",
    withdrawn: "درخواست پس گرفته شده است",
  },
  tiers: {
    basic: "عضویت پایه",
    supporter: "عضویت حامی",
    volunteer: "مشارکت فعال",
    research: "عضویت مرتبط با پژوهش",
    institutional: "عضویت نهادی",
  },
  documents: {
    statutes: "اساسنامه",
    "technical-protocol": "مقررات عضویت",
    "privacy-notice": "اطلاعیهٔ حریم خصوصی",
  },
  rolesMap: {
    editor: "ویراستار",
    reviewer: "بازبین",
    translator: "مترجم",
    publisher: "مسئول انتشار",
  },
};

export const operationsCopy: Record<Locale, OperationsCopy> = { de, en, fa };
