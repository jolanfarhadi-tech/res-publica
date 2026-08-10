import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { academyCopy } from "@/i18n/academy";
import { isLocale } from "@/i18n/config";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = academyCopy[locale];
  return { title: copy.title, description: copy.lede, alternates: pageAlternates(locale, "/academy") };
}

export default async function AcademyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = academyCopy[locale];
  return <>
    <PageHeader title={copy.title} lede={copy.lede} />
    <Container className="py-14 sm:py-20">
      <Card title={copy.principleTitle}>{copy.principleText}</Card>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={`/${locale}/academy/courses`}>{copy.coursesAction}</Button>
        <Button href={`/${locale}/dashboard/academy`} variant="secondary">{copy.dashboardAction}</Button>
      </div>
      <p className="mt-10 max-w-3xl text-sm leading-relaxed text-muted">{copy.nonAccredited}</p>
    </Container>
  </>;
}
