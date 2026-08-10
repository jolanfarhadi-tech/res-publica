import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeGraphOperationsClient } from "@/components/platform/KnowledgeGraphOperationsClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { isLocale } from "@/i18n/config";
import { knowledgeGraphCopy } from "@/i18n/knowledge-graph";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = knowledgeGraphCopy[locale];
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/operations/knowledge-graph"),
    robots: { index: false, follow: false },
  };
}

export default async function KnowledgeGraphOperationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = knowledgeGraphCopy[locale];
  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <KnowledgeGraphOperationsClient locale={locale} />
      </Container>
    </>
  );
}
