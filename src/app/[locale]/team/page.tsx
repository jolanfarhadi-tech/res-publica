import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { team } from "@/data/team";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PersonCard } from "@/components/ui/PersonCard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return { title: dict.pages.team.title, description: dict.pages.team.lede };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <>
      <PageHeader title={dict.pages.team.title} lede={dict.pages.team.lede} />
      <Container className="py-14 sm:py-20">
        <ul className="grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <PersonCard
                name={member.name}
                role={member.role[locale as Locale]}
                bio={member.bio[locale as Locale]}
              />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
