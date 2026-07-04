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
    <section className="border-b border-border">
      <Container className="py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {lede && (
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            {lede}
          </p>
        )}
        {updated && (
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold">
            {updated}
          </p>
        )}
      </Container>
    </section>
  );
}
