import Image from "next/image";
import { Container } from "./Container";

export type PageHeaderVisual =
  | "institution"
  | "membership"
  | "method"
  | "publications";

const headerImages: Record<PageHeaderVisual, string> = {
  institution: "/brand/page-header-institution-v1.webp",
  membership: "/brand/page-header-membership-v1.webp",
  method: "/brand/page-header-method-research-v1.webp",
  publications: "/brand/page-header-publications-v1.webp",
};

/**
 * PageHeader — the standard opening of every inner page:
 * serif title, muted lede, hairline divider below.
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
      <Image
        src={headerImages[visual]}
        alt=""
        fill
        priority
        sizes="100vw"
        className="site-page-header__media object-cover"
      />
      <div className="site-page-header__veil" aria-hidden="true" />
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
