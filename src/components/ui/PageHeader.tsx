import { Container } from "./Container";

/**
 * PageHeader — the standard opening of every inner page:
 * serif title, muted lede, hairline divider below.
 */
export function PageHeader({
  title,
  lede,
  updated,
}: {
  title: string;
  lede?: string;
  updated?: string;
}) {
  return (
    <section className="site-page-header relative isolate overflow-hidden border-b border-border text-night">
      <div className="observatory-orbit opacity-35" aria-hidden="true" />
      <Container className="relative z-10 py-16 sm:py-24">
        <h1 className="max-w-4xl text-5xl leading-[1.02] sm:text-6xl">{title}</h1>
        {lede && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-night/66">
            {lede}
          </p>
        )}
        {updated && (
          <p className="civic-label mt-5">
            {updated}
          </p>
        )}
      </Container>
    </section>
  );
}
