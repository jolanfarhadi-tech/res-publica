/**
 * Prose — a readable column for long-form text (about pages,
 * publications). Caps line length at ~70 characters.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        "reading-measure text-[1.075rem] leading-[1.82] sm:text-lg " +
        "[&_p]:mb-6 " +
        "[&_h2]:mb-5 [&_h2]:mt-16 [&_h2]:text-3xl [&_h2]:leading-tight " +
        "[&_h3]:mb-4 [&_h3]:mt-12 [&_h3]:text-2xl " +
        "[&_ul]:mb-7 [&_ul]:list-disc [&_ul]:ps-6 " +
        "[&_ol]:mb-7 [&_ol]:list-decimal [&_ol]:ps-6 " +
        "[&_li]:mb-3 " +
        "[&_blockquote]:my-10 [&_blockquote]:border-s [&_blockquote]:border-verdigris [&_blockquote]:ps-6 [&_blockquote]:text-xl " +
        "[&_a]:font-semibold [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/30 [&_a]:underline-offset-4 " +
        "[&_strong]:font-semibold [&_em]:italic"
      }
    >
      {children}
    </div>
  );
}
