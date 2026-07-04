import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getEntries, getTags, type Collection, type Entry } from "@/lib/collections";
import { formatDate, todayIso } from "@/lib/dates";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { EntryCard } from "@/components/ui/EntryCard";
import { TagFilter } from "@/components/ui/TagFilter";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 9;

/** The extra metadata line under a card title, per collection. */
function cardMeta(entry: Entry, dict: Dictionary): string | undefined {
  const labels = dict.collections.labels;
  if (entry.collection === "events" && entry.location) return entry.location;
  if (entry.collection === "projects" && entry.status)
    return labels[entry.status];
  if (entry.authors && entry.authors.length > 0)
    return entry.authors.join(", ");
  return undefined;
}

function CardGrid({
  entries,
  locale,
  collection,
  dict,
}: {
  entries: Entry[];
  locale: Locale;
  collection: Collection;
  dict: Dictionary;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <EntryCard
          key={entry.slug}
          href={`/${locale}/${collection}/${entry.slug}`}
          title={entry.title}
          description={entry.description}
          date={formatDate(locale, entry.date)}
          tags={entry.tags}
          meta={cardMeta(entry, dict)}
        />
      ))}
    </div>
  );
}

/**
 * CollectionIndex — the shared list page for all four collections.
 * Tag filter and pagination live in the URL (?tag=…&page=…), so the
 * page stays a server component and filtered views are shareable.
 * Events get a special layout: upcoming first (soonest at the top),
 * then past events.
 */
export function CollectionIndex({
  locale,
  collection,
  dict,
  tag,
  page,
}: {
  locale: Locale;
  collection: Collection;
  dict: Dictionary;
  tag?: string;
  page: number;
}) {
  const labels = dict.collections.labels;
  const section = dict.collections[collection];
  const basePath = `/${locale}/${collection}`;

  const all = getEntries(locale, collection);
  const filtered = tag ? all.filter((entry) => entry.tags.includes(tag)) : all;

  return (
    <>
      <PageHeader title={section.title} lede={section.lede} />
      <Container className="py-14 sm:py-20">
        <TagFilter
          basePath={basePath}
          tags={getTags(locale, collection)}
          active={tag}
          allLabel={labels.all}
          ariaLabel={labels.filterByTag}
        />

        {filtered.length === 0 && (
          <p className="text-muted">{labels.noEntries}</p>
        )}

        {collection === "events" ? (
          <EventsList
            entries={filtered}
            locale={locale}
            dict={dict}
          />
        ) : (
          <PaginatedList
            entries={filtered}
            locale={locale}
            collection={collection}
            dict={dict}
            basePath={basePath}
            tag={tag}
            page={page}
          />
        )}
      </Container>
    </>
  );
}

function PaginatedList({
  entries,
  locale,
  collection,
  dict,
  basePath,
  tag,
  page,
}: {
  entries: Entry[];
  locale: Locale;
  collection: Collection;
  dict: Dictionary;
  basePath: string;
  tag?: string;
  page: number;
}) {
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const visible = entries.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <>
      <CardGrid
        entries={visible}
        locale={locale}
        collection={collection}
        dict={dict}
      />
      <Pagination
        basePath={basePath}
        page={safePage}
        totalPages={totalPages}
        tag={tag}
        labels={dict.collections.labels}
      />
    </>
  );
}

function EventsList({
  entries,
  locale,
  dict,
}: {
  entries: Entry[];
  locale: Locale;
  dict: Dictionary;
}) {
  const today = todayIso();
  // Upcoming: soonest first. Past: most recent first.
  const upcoming = entries
    .filter((entry) => (entry.endDate ?? entry.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = entries.filter((entry) => (entry.endDate ?? entry.date) < today);
  const labels = dict.collections.labels;

  return (
    <div className="space-y-14">
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl">{labels.upcoming}</h2>
          <CardGrid
            entries={upcoming}
            locale={locale}
            collection="events"
            dict={dict}
          />
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl">{labels.past}</h2>
          <CardGrid
            entries={past}
            locale={locale}
            collection="events"
            dict={dict}
          />
        </section>
      )}
    </div>
  );
}
