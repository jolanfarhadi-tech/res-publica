import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPageDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  return { title: `${dict.pages.publications.title} — ${dict.meta.title}` };
}

export default async function PublicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  const { heading, intro, empty } = dict.pages.publications;

  return (
    <Container className="py-16 md:py-24">
      <PageHeader heading={heading} description={intro} />
      <EmptyState message={empty} />
    </Container>
  );
}
