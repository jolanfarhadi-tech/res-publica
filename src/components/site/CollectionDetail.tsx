import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getRelated, type Entry } from "@/lib/collections";
import { formatDate } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { EntryCard } from "@/components/ui/EntryCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo";

/** One quiet "label: value" line in the metadata block. */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="min-w-24 text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

/**
 * CollectionDetail — the shared detail page for all four
 * collections: header with date and tags, a metadata block for
 * the fields that exist, the MDX body, and related entries.
 */
export function CollectionDetail({
  locale,
  entry,
  dict,
  action,
}: {
  locale: Locale;
  entry: Entry;
  dict: Dictionary;
  action?: React.ReactNode;
}) {
  const labels = dict.collections.labels;
  const basePath = `/${locale}/${entry.collection}`;
  const related = getRelated(locale, entry);

  const dateText =
    entry.endDate && entry.endDate !== entry.date
      ? `${formatDate(locale, entry.date)} – ${formatDate(locale, entry.endDate)}`
      : formatDate(locale, entry.date);

  const pageUrl = absoluteUrl(`${basePath}/${entry.slug}`);
  const structuredData =
    entry.collection === "events"
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: entry.title,
          description: entry.description,
          startDate: entry.date,
          ...(entry.endDate ? { endDate: entry.endDate } : {}),
          ...(entry.location
            ? { location: { "@type": "Place", name: entry.location } }
            : {}),
          organizer: { "@type": "Organization", name: "Res Publica" },
          url: pageUrl,
        }
      : {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: entry.title,
          description: entry.description,
          datePublished: entry.date,
          inLanguage: locale,
          author: (entry.authors ?? ["Res Publica"]).map((name) => ({
            "@type": name === "Res Publica" ? "Organization" : "Person",
            name,
          })),
          publisher: { "@type": "Organization", name: "Res Publica" },
          url: pageUrl,
        };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Res Publica",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: dict.collections[entry.collection].title,
        item: absoluteUrl(basePath),
      },
      { "@type": "ListItem", position: 3, name: entry.title, item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbs} />
      <section className="border-b border-border">
        <Container className="py-16 sm:py-20">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">
            {dict.collections[entry.collection].title} · {dateText}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl sm:text-5xl">{entry.title}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            {entry.description}
          </p>

          {(entry.location || entry.authors || entry.status) && (
            <dl className="mt-8 space-y-2">
              {entry.location && (
                <MetaRow label={labels.location} value={entry.location} />
              )}
              {entry.authors && entry.authors.length > 0 && (
                <MetaRow
                  label={labels.authors}
                  value={entry.authors.join(", ")}
                />
              )}
              {entry.status && (
                <MetaRow label={labels.status} value={labels[entry.status]} />
              )}
            </dl>
          )}
        </Container>
      </section>

      <Container className="py-14 sm:py-20">
        <Prose>
          <MDXRemote source={entry.body} />
        </Prose>
        {action}

        <p className="mt-12">
          <Link
            href={basePath}
            className="text-sm text-accent underline underline-offset-4"
          >
            {labels.back}
          </Link>
        </p>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="mb-6 text-2xl">{labels.related}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <EntryCard
                  key={other.slug}
                  href={`${basePath}/${other.slug}`}
                  title={other.title}
                  description={other.description}
                  date={formatDate(locale, other.date)}
                  tags={other.tags}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
