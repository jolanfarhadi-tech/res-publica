import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPageDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  return { title: `${dict.pages.contact.title} — ${dict.meta.title}` };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  const { heading, intro, emailLabel, email } = dict.pages.contact;

  return (
    <Container className="py-16 md:py-24">
      <PageHeader heading={heading} description={intro} />
      <Card className="max-w-sm">
        <p className="text-sm font-medium text-muted">{emailLabel}</p>
        <a
          href={`mailto:${email}`}
          className="text-lg font-medium text-primary hover:underline"
        >
          {email}
        </a>
      </Card>
    </Container>
  );
}
