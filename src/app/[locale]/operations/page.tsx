import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OperationsConsoleClient } from "@/components/platform/OperationsConsoleClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { isLocale } from "@/i18n/config";
import { operationsCopy } from "@/i18n/operations";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = operationsCopy[locale];
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/operations"),
    robots: { index: false, follow: false },
  };
}

export default async function OperationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = operationsCopy[locale];

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <OperationsConsoleClient locale={locale} />
      </Container>
    </>
  );
}
