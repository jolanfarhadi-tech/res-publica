import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { params: Promise<{ locale: string }> };

const copy = {
  de: {
    title: "Technisches Mitgliedschaftsprotokoll",
    lede: "Version membership-application-protocol-v1 — kein Ersatz für die Satzung und keine eigenständige Mitgliedschaftsregelung.",
    steps: ["Konto bei Auth0 erstellen", "E-Mail bei Auth0 bestätigen", "Mitgliedschaftsantrag absenden", "Prüfung durch den Vorstand", "MFA-geschützte und protokollierte Entscheidung", "Erst nach Zustimmung: verifizierte Mitgliedschaft"],
    boundary: "E-Mail-Bestätigung aktiviert nur das Konto. Sie bestätigt keine Mitgliedschaft. Bis zur Vorstandsentscheidung besteht ein aktives Konto mit offenem Antrag.",
  },
  en: {
    title: "Technical membership protocol",
    lede: "Version membership-application-protocol-v1 — not a substitute for the statutes and not a separate membership regulation.",
    steps: ["Create an account with Auth0", "Verify the email address with Auth0", "Submit the membership application", "Review by the board", "MFA-protected and audited decision", "Only after approval: verified membership"],
    boundary: "Email verification activates only the account. It does not confirm membership. Until the board decides, the person has an active account with a pending application.",
  },
  fa: {
    title: "پروتکل فنی عضویت",
    lede: "نسخه membership-application-protocol-v1 — جایگزین اساسنامه یا آیین‌نامه مستقل عضویت نیست.",
    steps: ["ایجاد حساب در Auth0", "تأیید ایمیل در Auth0", "ارسال درخواست عضویت", "بررسی توسط هیئت‌مدیره", "تصمیم حفاظت‌شده با MFA و ثبت حسابرسی", "فقط پس از پذیرش: عضویت تأییدشده"],
    boundary: "تأیید ایمیل فقط حساب را فعال می‌کند و به‌معنای تأیید عضویت نیست. تا تصمیم هیئت‌مدیره، فرد حساب فعال و درخواست عضویت در حال بررسی دارد.",
  },
} as const satisfies Record<Locale, object>;

export default async function MembershipProtocolPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = copy[locale];
  return (
    <>
      <PageHeader title={t.title} lede={t.lede} />
      <Container className="py-14 sm:py-20">
        <ol className="max-w-3xl space-y-3">
          {t.steps.map((step, index) => (
            <li key={step} className="glass-panel flex items-start gap-4 rounded-xl p-4">
              <span className="editorial-index text-sm text-accent" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted">{t.boundary}</p>
      </Container>
    </>
  );
}
