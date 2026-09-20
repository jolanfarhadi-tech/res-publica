import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { CinematicReadingSurface } from "./CinematicReadingSurface";

/** Three peer domains; shared services support them, never confer authority. */
export function EcosystemAtlas({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).home.ecosystem;
  const domains = copy.platforms.slice(0, 3);
  const shared = copy.platforms[3];
  const number = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, { minimumIntegerDigits: 2 });

  return (
    <CinematicReadingSurface>
    <figure className="ecosystem-atlas" aria-label={copy.eyebrow}>
      <div className="ecosystem-atlas__masthead">
        <Image src="/brand/res-publica-logo.png" width={1200} height={216} alt="Res Publica" className="ecosystem-atlas__brand" />
        <span className="ecosystem-atlas__edition" aria-hidden="true" dir="ltr">RP / {number.format(1)}—{number.format(3)}</span>
      </div>
      <ol className="ecosystem-atlas__domains">
        {domains.map((domain, index) => (
          <li key={domain.name} className="ecosystem-atlas__domain">
            <span className="ecosystem-atlas__number" aria-hidden="true">{number.format(index + 1)}</span>
            <svg className="ecosystem-atlas__section" viewBox="0 0 180 100" aria-hidden="true" focusable="false">
              <path d="M20 68 90 92 160 68 90 44Z" fill="currentColor" opacity=".06" />
              <path d="M20 56 90 80 160 56M20 47 90 71 160 47" fill="none" stroke="currentColor" opacity=".25" />
              <path d="M20 38 90 62 160 38 90 14Z" fill="currentColor" fillOpacity=".06" stroke="currentColor" />
              <path d="M20 38v18M90 62v18M160 38v18M48 29v37M76 19v57M104 19v57M132 29v37" fill="none" stroke="currentColor" strokeWidth=".6" opacity=".35" />
              {index === 0 && <path d="M66 31c0-9 48-9 48 0v10c0 9-48 9-48 0Z" fill="none" stroke="currentColor" />}
              {index === 1 && <path d="m63 37 27-10 27 10-27 10Zm0 6 27 10 27-10" fill="none" stroke="currentColor" />}
              {index === 2 && <path d="m68 41 22-25 22 25-22 9Zm22-25v34" fill="none" stroke="currentColor" />}
            </svg>
            <h3>{domain.name}</h3>
            <p>{domain.scope}</p>
          </li>
        ))}
      </ol>
      <div className="ecosystem-atlas__connections" aria-hidden="true"><span /><span /><span /></div>
      <div className="ecosystem-atlas__services">
        <span className="ecosystem-atlas__number" aria-hidden="true">{number.format(4)}</span>
        <div><h3>{shared.name}</h3><p>{shared.scope}</p></div>
        <svg viewBox="0 0 80 30" aria-hidden="true" focusable="false"><path d="M0 7h80M0 15h80M0 23h80" fill="none" stroke="currentColor" /><path d="M15 0v30M40 0v30M65 0v30" fill="none" stroke="currentColor" opacity=".3" /></svg>
      </div>
      <ul className="ecosystem-atlas__principles" aria-label={copy.eyebrow}>
        {copy.principles.map((principle) => <li key={principle}>{principle}</li>)}
      </ul>
      <figcaption>{copy.graphicCaption}</figcaption>
    </figure>
    </CinematicReadingSurface>
  );
}
