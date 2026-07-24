import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function EcosystemOverview({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).offerings;
  const labels =
    locale === "de"
      ? ["Zivile Beteiligung", "HARM & Verantwortung", "Lernen", "Forschung & Publikation"]
      : locale === "fa"
        ? ["مشارکت مدنی", "HARM و مسئولیت", "یادگیری", "پژوهش و انتشار"]
        : ["Civic participation", "HARM & responsibility", "Learning", "Research & publication"];

  return (
    <section aria-labelledby="ecosystem-title" className="border-y border-border py-12">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <h2 id="ecosystem-title" className="text-3xl sm:text-4xl">
          {copy.ecosystemTitle}
        </h2>
        <div>
          <p className="max-w-3xl text-lg leading-relaxed text-muted">
            {copy.ecosystem}
          </p>
          <ul className="mt-8 grid list-none gap-px bg-border sm:grid-cols-2">
            {labels.map((label, index) => (
              <li key={label} className="bg-bg p-5">
                <span className="editorial-index me-3 text-xs text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
