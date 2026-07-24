import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { pageAlternates } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getPublicSiteCopy(locale).method;
  return {
    title: copy.title,
    description: copy.lede,
    alternates: pageAlternates(locale, "/method"),
  };
}

export default async function MethodPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getPublicSiteCopy(locale as Locale).method;

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="py-14 sm:py-20">
        <section aria-labelledby="harm-lens" className="grid gap-8 border-y border-border py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="harm-lens" className="text-3xl sm:text-4xl">{copy.lensTitle}</h2>
          <p className="text-lg leading-relaxed text-muted">{copy.lens}</p>
        </section>

        <section aria-labelledby="harm-stages" className="py-16 sm:py-20">
          <h2 id="harm-stages" className="text-4xl sm:text-5xl">{copy.stagesTitle}</h2>
          <ol className="mt-10 grid list-none gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {copy.stages.map(([title, text], index) => (
              <li key={title} className="bg-bg p-6 sm:p-7">
                <span className="editorial-index text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-2xl">{title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="responsibility-innovations" className="border-y border-border py-16 sm:py-20">
          <h2 id="responsibility-innovations" className="text-4xl sm:text-5xl">{copy.innovationsTitle}</h2>
          <ul className="mt-10 grid list-none gap-8 md:grid-cols-2">
            {copy.innovations.map(([title, text]) => (
              <li key={title} className="border-t border-border pt-6">
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="method-safeguards" className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="method-safeguards" className="text-4xl sm:text-5xl">{copy.safeguardsTitle}</h2>
          <ul className="list-none space-y-4">
            {copy.safeguards.map((item, index) => (
              <li key={item} className="grid grid-cols-[2.5rem_1fr] border-t border-border pt-4">
                <span className="editorial-index text-xs text-gold">{String(index + 1).padStart(2, "0")}</span>
                <span className="leading-relaxed text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside aria-labelledby="publishing-safeguard" className="bg-night p-8 text-paper sm:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-signal">Publishing Authority</p>
          <h2 id="publishing-safeguard" className="mt-5 text-3xl sm:text-4xl">{copy.publishingTitle}</h2>
          <p className="mt-6 max-w-4xl text-lg leading-relaxed text-paper/72">{copy.publishing}</p>
        </aside>
      </Container>
    </>
  );
}
