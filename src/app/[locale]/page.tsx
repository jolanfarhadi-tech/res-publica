import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";

/**
 * Home — Milestone 1 skeleton.
 * Its job is to prove the design system end to end:
 * tokens, both themes, all three languages, RTL, type, motion.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale as Locale);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <Container className="py-24 sm:py-32">
          <FadeIn>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-gold">
              {dict.hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {dict.hero.lede}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={`/${locale}/mission-vision`}>{dict.hero.ctaPrimary}</Button>
              <Button href={`/${locale}/contact`} variant="secondary">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Pillars */}
      <section>
        <Container className="py-16 sm:py-24">
          <FadeIn>
            <SectionHeading eyebrow="Res Publica">
              {dict.pillars.heading}
            </SectionHeading>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.pillars.items.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08}>
                <Card title={item.title}>{item.text}</Card>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Call to action */}
      <section className="border-t border-border bg-surface">
        <Container className="py-16 sm:py-20">
          <FadeIn className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl">{dict.cta.title}</h2>
              <p className="mt-2 text-muted">{dict.cta.text}</p>
            </div>
            <Button href={`/${locale}/contact`}>{dict.cta.button}</Button>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
