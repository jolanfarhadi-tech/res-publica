/**
 * Card — quiet surface for grid content (pillars, later:
 * projects, events, publications).
 */
export function Card({
  title,
  children,
  headingLevel = 3,
}: {
  title: string;
  children: React.ReactNode;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7">
      <Heading className="text-2xl">{title}</Heading>
      <p className="mt-4 leading-relaxed text-muted">{children}</p>
    </div>
  );
}
