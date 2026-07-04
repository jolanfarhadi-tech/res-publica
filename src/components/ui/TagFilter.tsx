import Link from "next/link";

/**
 * TagFilter — a row of tag links above a collection list.
 * Filtering works via the `?tag=` URL parameter, so it needs
 * no client-side JavaScript and filtered views are shareable.
 */
export function TagFilter({
  basePath,
  tags,
  active,
  allLabel,
  ariaLabel,
}: {
  basePath: string;
  tags: string[];
  active?: string;
  allLabel: string;
  ariaLabel: string;
}) {
  if (tags.length === 0) return null;

  const pill = (isActive: boolean) =>
    `inline-block rounded-full border px-3.5 py-1 text-sm transition-colors ${
      isActive
        ? "border-accent bg-accent text-accent-contrast"
        : "border-border text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <nav aria-label={ariaLabel} className="mb-10">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href={basePath} className={pill(!active)}>
            {allLabel}
          </Link>
        </li>
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              href={`${basePath}?tag=${encodeURIComponent(tag)}`}
              className={pill(active === tag)}
              aria-current={active === tag ? "true" : undefined}
            >
              {tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
