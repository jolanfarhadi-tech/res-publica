import Link from "next/link";

/**
 * EntryCard — the shared list card for all four collections.
 * The whole card is one link; metadata stays quiet.
 */
export function EntryCard({
  href,
  title,
  description,
  date,
  tags,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  /** Already locale-formatted date string. */
  date: string;
  tags?: string[];
  /** Extra line, e.g. event location or project status. */
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-accent"
    >
      <p className="text-xs uppercase tracking-[0.15em] text-gold">{date}</p>
      <h3 className="mt-3 text-xl transition-colors group-hover:text-accent">
        {title}
      </h3>
      {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
      <p className="mt-3 flex-1 leading-relaxed text-muted">{description}</p>
      {tags && tags.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </p>
      )}
    </Link>
  );
}
