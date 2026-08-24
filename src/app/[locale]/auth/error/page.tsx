import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  authRecoveryCopy,
  authRecoveryReasons,
  type AuthRecoveryReason,
} from "@/i18n/auth-recovery";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reason?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: authRecoveryCopy[locale].title,
    robots: { index: false, follow: false },
    alternates: pageAlternates(locale, "/auth/error"),
  };
}

export default async function AuthErrorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { reason: rawReason } = await searchParams;
  const reason: AuthRecoveryReason = authRecoveryReasons.includes(
    rawReason as AuthRecoveryReason
  )
    ? (rawReason as AuthRecoveryReason)
    : "authentication_callback_failed";
  const copy = authRecoveryCopy[locale];
  const returnTo = `/${locale}/membership`;

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="section-shell">
        <div className="glass-panel max-w-3xl rounded-2xl p-6 sm:p-9">
          <p role="alert" className="text-lg leading-relaxed text-ink">
            {copy.messages[reason]}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
              className="button-primary"
            >
              {copy.signIn}
            </a>
            <a
              href={`/api/auth/login?mode=signup&returnTo=${encodeURIComponent(returnTo)}`}
              className="button-secondary"
            >
              {copy.createAccount}
            </a>
            <Link href={`/${locale}`} className="button-secondary">
              {copy.home}
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
