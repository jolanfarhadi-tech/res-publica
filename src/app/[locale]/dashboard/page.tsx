import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DashboardClient } from "@/components/platform/DashboardClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { dashboardCopy } from "@/i18n/dashboard";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = dashboardCopy[locale];
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/dashboard"),
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = dashboardCopy[locale];

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <DashboardClient locale={locale} />
      </Container>
    </>
  );
}
