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
    <div className="glass-panel rounded-2xl p-6 sm:p-7">
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-4 leading-relaxed text-muted">{children}</p>
    </div>
  );
}
