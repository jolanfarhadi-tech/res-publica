import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FellowshipApplicationClient } from "@/components/platform/FellowshipApplicationClient";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { fellowshipCopy } from "@/i18n/fellowship";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = fellowshipCopy[locale];
  return { title: copy.title, description: copy.lede, alternates: pageAlternates(locale, "/fellowship") };
}

export default async function FellowshipPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = fellowshipCopy[locale];
  return <>
    <PageHeader title={copy.title} lede={copy.lede} />
    <Container className="py-14 sm:py-20">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={copy.principleTitle}>{copy.principleText}</Card>
        <Card title={copy.processTitle}>{copy.processText}</Card>
      </div>
      <div className="mt-8"><Button href={`/${locale}/dashboard/fellowship`} variant="secondary">{copy.dashboardAction}</Button></div>
      <section className="mt-14" aria-labelledby="fellowship-application-title">
        <h2 id="fellowship-application-title" className="text-4xl">{copy.applicationTitle}</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{copy.applicationLede}</p>
        <div className="mt-7 max-w-3xl"><FellowshipApplicationClient locale={locale} enabled={process.env.FELLOWSHIP_APPLICATIONS_ENABLED === "true"} /></div>
      </section>
    </Container>
  </>;
}
