import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function ConstellationNarrative({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).home.constellation;

  return (
    <figure className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className="relative min-h-80 overflow-hidden border border-paper/20 bg-paper/[0.03] p-5 sm:min-h-96">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 720 420"
          preserveAspectRatio="xMidYMid meet"
        >
          <g fill="none" stroke="currentColor" className="text-signal/55" strokeWidth="1.5">
            <path d="M115 286 L287 112" />
            <path d="M287 112 L478 175" />
            <path d="M478 175 L603 302" />
          </g>
          <g className="text-paper">
            <circle cx="115" cy="286" r="8" fill="currentColor" />
            <circle cx="287" cy="112" r="6" fill="currentColor" />
            <circle cx="478" cy="175" r="9" fill="currentColor" />
            <circle cx="603" cy="302" r="7" fill="currentColor" />
          </g>
          <g className="text-signal" fill="currentColor">
            <path d="M115 263l4 13 13 4-13 4-4 13-4-13-13-4 13-4z" />
            <path d="M287 91l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
            <path d="M478 151l4 13 13 4-13 4-4 13-4-13-13-4 13-4z" />
            <path d="M603 280l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />
          </g>
        </svg>
        <ol className="relative z-10 grid min-h-72 grid-cols-2 content-between gap-8 text-xs uppercase tracking-[0.14em] text-paper/70 sm:min-h-80">
          {copy.nodes.map((node, index) => (
            <li
              key={node}
              className={index % 2 === 1 ? "text-end" : "text-start"}
            >
              <span className="editorial-index text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 block">{node}</span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="border-s border-paper/25 ps-6 text-base leading-relaxed text-paper/72">
        {copy.caption}
      </figcaption>
    </figure>
  );
}
