import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).contact;
  return (
    <div className="max-w-3xl border-s-4 border-gold bg-surface p-7 sm:p-9">
      <a
        href="mailto:kontakt@respublica-ev.de"
        className="inline-flex min-h-12 items-center border border-accent px-6 font-semibold text-accent transition-colors hover:bg-accent hover:text-paper"
      >
        {copy.action}
      </a>
      <p className="mt-5 text-sm leading-relaxed text-muted">{copy.notice}</p>
    </div>
  );
}
