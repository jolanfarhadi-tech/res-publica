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
  return { title: `${dict.pages.missionVision.title} — ${dict.meta.title}` };
}

export default async function MissionVisionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getPageDictionary(lang);
  const { heading, mission, vision } = dict.pages.missionVision;

  return (
    <Container className="py-16 md:py-24">
      <PageHeader heading={heading} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-foreground">{mission.heading}</h2>
          <p className="mt-3 leading-8 text-muted">{mission.body}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold text-foreground">{vision.heading}</h2>
          <p className="mt-3 leading-8 text-muted">{vision.body}</p>
        </Card>
      </div>
    </Container>
  );
}
