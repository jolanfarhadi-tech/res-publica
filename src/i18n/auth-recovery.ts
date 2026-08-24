import type { Locale } from "./config";

export const authRecoveryReasons = [
  "authentication_not_configured",
  "invalid_authentication_state",
  "invalid_or_expired_authentication_state",
  "email_verification_pending",
  "identity_not_provisioned",
  "identity_review_required",
  "authentication_callback_failed",
] as const;

export type AuthRecoveryReason = (typeof authRecoveryReasons)[number];

type AuthRecoveryCopy = {
  title: string;
  lede: string;
  messages: Record<AuthRecoveryReason, string>;
  signIn: string;
  createAccount: string;
  home: string;
};

export const authRecoveryCopy: Record<Locale, AuthRecoveryCopy> = {
  de: {
    title: "Anmeldung nicht abgeschlossen",
    lede: "Ihre Sitzung und Ihre Mitgliedschaftsdaten wurden nicht verändert.",
    messages: {
      authentication_not_configured: "Die Anmeldung ist derzeit nicht verfügbar.",
      invalid_authentication_state: "Diese Anmeldung enthält keinen gültigen Sicherheitsstatus. Starten Sie die Anmeldung bitte erneut.",
      invalid_or_expired_authentication_state: "Dieser Anmeldevorgang ist abgelaufen oder wurde bereits verwendet. Starten Sie bitte einen neuen Vorgang.",
      email_verification_pending: "Bestätigen Sie zuerst Ihre E-Mail-Adresse beim Identitätsanbieter und starten Sie die Anmeldung danach erneut.",
      identity_not_provisioned: "Für dieses Konto besteht noch kein freigegebener Zugang. Neue Personen können ein Konto erstellen und anschließend einen Mitgliedschaftsantrag stellen.",
      identity_review_required: "Dieses Konto benötigt eine interne Prüfung, bevor die Anmeldung fortgesetzt werden kann.",
      authentication_callback_failed: "Der Identitätsanbieter konnte die Anmeldung nicht sicher abschließen. Bitte versuchen Sie es erneut.",
    },
    signIn: "Anmeldung neu starten",
    createAccount: "Mitgliedschaft beantragen / Konto erstellen",
    home: "Zur Startseite",
  },
  en: {
    title: "Sign-in was not completed",
    lede: "Your session and membership data were not changed.",
    messages: {
      authentication_not_configured: "Sign-in is currently unavailable.",
      invalid_authentication_state: "This sign-in has no valid security state. Please start sign-in again.",
      invalid_or_expired_authentication_state: "This sign-in attempt expired or was already used. Please start a new attempt.",
      email_verification_pending: "Verify your email address with the identity provider, then start sign-in again.",
      identity_not_provisioned: "This account does not yet have approved access. New people can create an account and then submit a membership application.",
      identity_review_required: "This account requires internal review before sign-in can continue.",
      authentication_callback_failed: "The identity provider could not complete sign-in securely. Please try again.",
    },
    signIn: "Restart sign-in",
    createAccount: "Apply for membership / Create account",
    home: "Return home",
  },
  fa: {
    title: "ورود کامل نشد",
    lede: "نشست شما و اطلاعات عضویتتان تغییر نکرده است.",
    messages: {
      authentication_not_configured: "ورود در حال حاضر در دسترس نیست.",
      invalid_authentication_state: "این فرایند ورود وضعیت امنیتی معتبری ندارد. لطفاً ورود را دوباره آغاز کنید.",
      invalid_or_expired_authentication_state: "این فرایند ورود منقضی شده یا قبلاً استفاده شده است. لطفاً فرایند تازه‌ای آغاز کنید.",
      email_verification_pending: "ابتدا نشانی ایمیل خود را نزد ارائه‌دهنده هویت تأیید کنید و سپس دوباره وارد شوید.",
      identity_not_provisioned: "برای این حساب هنوز دسترسی تأییدشده‌ای وجود ندارد. افراد جدید می‌توانند حساب ایجاد کنند و سپس درخواست عضویت بدهند.",
      identity_review_required: "پیش از ادامه ورود، این حساب به بررسی داخلی نیاز دارد.",
      authentication_callback_failed: "ارائه‌دهنده هویت نتوانست ورود را به‌صورت امن کامل کند. لطفاً دوباره تلاش کنید.",
    },
    signIn: "آغاز دوباره ورود",
    createAccount: "درخواست عضویت / ایجاد حساب",
    home: "بازگشت به صفحه اصلی",
  },
};
