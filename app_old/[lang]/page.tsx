import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <Container className="py-24">
        <Card className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {dict.home.heading}
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted">
            {dict.home.subheading}
          </p>
          <Button size="lg">{dict.home.cta}</Button>
        </Card>
      </Container>
    </div>
  );
}
