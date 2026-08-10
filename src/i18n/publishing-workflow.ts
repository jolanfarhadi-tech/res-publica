import type { Locale } from "./config";
import type { PublishingWorkflowAction } from "@/components/platform/publishing-workflow-state";

type Copy = {
  title: string; lede: string; action: string; target: string; titleField: string;
  sourceContent: string; draftContent: string; citations: string; citationsHelp: string;
  weakFlags: string; personId: string; locale: string; decision: string; reason: string;
  readyConfirm: string; submit: string; pending: string; success: string; invalid: string;
  failed: string; requestId: string; sourceRule: string;
  actions: Record<PublishingWorkflowAction, string>;
};

const de: Copy = {
  title: "Redaktioneller Vorgang", lede: "Jeder Schritt verwendet die bestehende MFA-, Rollen-, Versions- und Audit-Grenze.",
  action: "Vorgang", target: "Zieldatensatz", titleField: "Titel", sourceContent: "Quellmaterial",
  draftContent: "Redaktioneller Inhalt", citations: "Quellenangaben", citationsHelp: "Eine nachvollziehbare Quelle pro Zeile.",
  weakFlags: "Offene Quellenhinweise (optional, je Zeile)", personId: "Kanonische Person-ID der zuständigen Person",
  locale: "Zielsprache", decision: "Prüfentscheidung", reason: "Begründung", readyConfirm: "Ich bestätige die menschliche Schlussprüfung. Dieser Schritt markiert nur ‚bereit‘ und veröffentlicht nicht.",
  submit: "Vorgang sicher ausführen", pending: "Vorgang wird atomar gespeichert …", success: "Vorgang gespeichert; Arbeitsstand wurde aktualisiert.",
  invalid: "Bitte füllen Sie alle für diesen Schritt erforderlichen Felder aus.", failed: "Der Vorgang wurde abgelehnt oder konnte nicht gespeichert werden.",
  requestId: "Anfrage-ID", sourceRule: "Öffentliche Dateien, Git-Commits, Deployments sowie die Zustände ‚veröffentlicht‘ und ‚archiviert‘ bleiben außerhalb dieser Oberfläche.",
  actions: { "create-submission": "Einreichung erfassen", "create-draft": "Entwurfsversion erstellen", "assign-reviewer": "Prüfung zuweisen", "decide-moderation": "Prüfung entscheiden", "assign-translation": "Übersetzung zuweisen", "finalize-translation": "Übersetzung menschlich finalisieren", "mark-ready": "Schlussprüfung und bereit markieren" },
};

const en: Copy = {
  title: "Editorial action", lede: "Every step uses the existing MFA, role, version and audit boundary.",
  action: "Action", target: "Target record", titleField: "Title", sourceContent: "Source material",
  draftContent: "Editorial content", citations: "Source references", citationsHelp: "One traceable source per line.",
  weakFlags: "Open source concerns (optional, one per line)", personId: "Canonical Person ID of the assignee",
  locale: "Target language", decision: "Review decision", reason: "Reason", readyConfirm: "I confirm the final human review. This step marks only ‘ready’ and does not publish.",
  submit: "Execute action securely", pending: "Recording the action atomically …", success: "Action recorded; the workspace has been refreshed.",
  invalid: "Complete every field required for this action.", failed: "The action was rejected or could not be recorded.",
  requestId: "Request ID", sourceRule: "Public files, Git commits, deployments, and the states ‘published’ and ‘archived’ remain outside this interface.",
  actions: { "create-submission": "Register submission", "create-draft": "Create draft version", "assign-reviewer": "Assign review", "decide-moderation": "Record review decision", "assign-translation": "Assign translation", "finalize-translation": "Human-finalize translation", "mark-ready": "Final review and mark ready" },
};

const fa: Copy = {
  title: "اقدام تحریریه", lede: "هر گام از مرز موجود MFA، نقش، نسخه و حسابرسی استفاده می‌کند.",
  action: "اقدام", target: "رکورد هدف", titleField: "عنوان", sourceContent: "مواد منبع",
  draftContent: "محتوای تحریریه", citations: "ارجاع‌های منبع", citationsHelp: "در هر خط یک منبع قابل‌پیگیری.",
  weakFlags: "نکات باز دربارهٔ منبع (اختیاری، هر مورد یک خط)", personId: "شناسهٔ canonical Person فرد مسئول",
  locale: "زبان مقصد", decision: "تصمیم بازبینی", reason: "دلیل", readyConfirm: "بازبینی نهایی انسانی را تأیید می‌کنم. این گام فقط وضعیت «آماده» را ثبت می‌کند و انتشار انجام نمی‌دهد.",
  submit: "اجرای امن اقدام", pending: "اقدام به‌صورت اتمی ثبت می‌شود…", success: "اقدام ثبت و محیط کاری به‌روزرسانی شد.",
  invalid: "همهٔ فیلدهای لازم برای این اقدام را تکمیل کنید.", failed: "اقدام رد شد یا ثبت آن ممکن نبود.",
  requestId: "شناسهٔ درخواست", sourceRule: "فایل‌های عمومی، Git commit، استقرار و وضعیت‌های «منتشرشده» و «بایگانی‌شده» خارج از این رابط می‌مانند.",
  actions: { "create-submission": "ثبت ارسال", "create-draft": "ایجاد نسخهٔ پیش‌نویس", "assign-reviewer": "واگذاری بازبینی", "decide-moderation": "ثبت تصمیم بازبینی", "assign-translation": "واگذاری ترجمه", "finalize-translation": "نهایی‌سازی انسانی ترجمه", "mark-ready": "بازبینی نهایی و علامت‌گذاری آماده" },
};

export const publishingWorkflowCopy: Record<Locale, Copy> = { de, en, fa };
