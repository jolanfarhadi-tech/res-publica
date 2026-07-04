/**
 * Card — quiet surface for grid content (pillars, later:
 * projects, events, publications).
 */
export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-7">
      <h3 className="mb-3 text-xl">{title}</h3>
      <p className="leading-relaxed text-muted">{children}</p>
    </div>
  );
}
