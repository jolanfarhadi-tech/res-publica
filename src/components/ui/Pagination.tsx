import Link from "next/link";

/**
 * Pagination — appears only when a list exceeds one page.
 * Page state lives in the `?page=` URL parameter; the current
 * tag filter is preserved when switching pages.
 */
export function Pagination({
  basePath,
  page,
  totalPages,
  tag,
  labels,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  tag?: string;
  labels: { previous: string; next: string; pageOf: string };
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const status = labels.pageOf
    .replace("{page}", String(page))
    .replace("{total}", String(totalPages));

  const link =
    "rounded-full border border-border px-4 py-1.5 text-sm text-muted " +
    "transition-colors hover:border-accent hover:text-accent";

  return (
    <nav className="mt-12 flex items-center justify-between gap-4">
      <div>
        {page > 1 && (
          <Link href={href(page - 1)} className={link} rel="prev">
            {labels.previous}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted">{status}</p>
      <div>
        {page < totalPages && (
          <Link href={href(page + 1)} className={link} rel="next">
            {labels.next}
          </Link>
        )}
      </div>
    </nav>
  );
}
