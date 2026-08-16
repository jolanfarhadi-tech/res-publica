import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SecurityOperationsClient } from "@/components/platform/SecurityOperationsClient";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { isLocale } from "@/i18n/config";
import { securityOperationsCopy } from "@/i18n/security-operations";
import { pageAlternates } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = securityOperationsCopy[locale];
  return { title: copy.title, description: copy.lede, alternates: pageAlternates(locale, "/operations/security"), robots: { index: false, follow: false } };
}
export default async function SecurityOperationsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = securityOperationsCopy[locale];
  return <><PageHeader title={copy.title} lede={copy.lede} /><Container className="py-14 sm:py-20"><SecurityOperationsClient locale={locale} /></Container></>;
}
