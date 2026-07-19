import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/site/LegalPage";
import { isLocale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false, follow: true },
};

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <LegalPage document="impressum" />;
}
