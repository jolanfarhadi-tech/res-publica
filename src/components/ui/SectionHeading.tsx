/**
 * SectionHeading — an optional small "eyebrow" line above a
 * serif heading. The gold interpunct is part of the brand voice.
 */
export function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl">{children}</h2>
    </div>
  );
}
