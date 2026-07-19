import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { MembershipForm } from "@/components/platform/MembershipForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).platform.membership;
  return { title: t.title, description: t.lede, alternates: pageAlternates(locale, "/membership") };
}

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);
  return (
    <>
      <PageHeader title={dict.platform.membership.title} lede={dict.platform.membership.lede} />
      <Container className="py-14 sm:py-20"><MembershipForm locale={locale as Locale} dict={dict} /></Container>
    </>
  );
}
