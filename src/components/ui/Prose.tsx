/**
 * Prose — a readable column for long-form text (about pages,
 * publications). Caps line length at ~70 characters.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "max-w-prose text-lg leading-relaxed " +
        "[&_p]:mb-5 " +
        "[&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl " +
        "[&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl " +
        "[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:ps-6 " +
        "[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:ps-6 " +
        "[&_li]:mb-2 " +
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 " +
        "[&_strong]:font-semibold [&_em]:italic"
      }
    >
      {children}
    </div>
  );
}
