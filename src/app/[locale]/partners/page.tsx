import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { partners } from "@/data/partners";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.pages.partners.title,
    description: dict.pages.partners.lede,
  };
}

export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <PageHeader
        title={dict.pages.partners.title}
        lede={dict.pages.partners.lede}
      />
      <Container className="py-14 sm:py-20">
        <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => {
            const card = (
              <div className="h-full rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent">
                <p className="font-serif text-xl">{partner.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {partner.description[locale as Locale]}
                </p>
              </div>
            );
            return (
              <li key={partner.id}>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    {card}
                  </a>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
