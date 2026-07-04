import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPageDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  return { title: `${dict.pages.about.title} — ${dict.meta.title}` };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  const { heading, intro, paragraphs } = dict.pages.about;

  return (
    <Container className="py-16 md:py-24">
      <PageHeader heading={heading} description={intro} />
      <div className="max-w-2xl space-y-4 text-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-8 text-muted">
            {paragraph}
          </p>
        ))}
      </div>
    </Container>
  );
}
