import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).contact;
  return (
    <div className="glass-panel max-w-3xl rounded-2xl p-6 sm:p-9">
      <a
        href="mailto:kontakt@respublica-ev.de"
        className="button-primary"
      >
        {copy.action}
      </a>
      <p className="mt-5 text-sm leading-relaxed text-muted">{copy.notice}</p>
    </div>
  );
}
