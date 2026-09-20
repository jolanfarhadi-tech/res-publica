import { Container } from "./Container";

export type PageHeaderVisual =
  | "institution"
  | "membership"
  | "method"
  | "publications";

/**
 * Inner-page reading surface over the shared architectural shell.
 * Room imagery is owned by that shell, never a second background here.
 */
export function PageHeader({
  title,
  lede,
  updated,
  visual = "institution",
}: {
  title: string;
  lede?: string;
  updated?: string;
  visual?: PageHeaderVisual;
}) {
  return (
    <section
      className="site-page-header relative isolate overflow-hidden border-b border-paper/15 text-paper"
      data-visual={visual}
    >
      <Container className="site-page-header__content relative z-10 flex min-h-[22rem] items-end py-12 sm:min-h-[28rem] sm:py-16">
        <div className="site-page-header__copy max-w-4xl rounded-[2rem] border border-paper/15 bg-night/48 p-6 shadow-2xl backdrop-blur-md sm:p-9">
          <h1 className="text-5xl leading-[1.02] text-paper sm:text-6xl">{title}</h1>
          {lede && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/78">
              {lede}
            </p>
          )}
          {updated && (
            <p className="civic-label inverse-label mt-5">
              {updated}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
