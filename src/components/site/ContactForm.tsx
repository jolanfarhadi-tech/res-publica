import type { Locale } from "@/i18n/config";
import { getPublicSiteCopy } from "@/i18n/public-site";

/**
 * There is no confirmed contact-delivery backend. This explicit state is
 * intentionally rendered instead of a form that could imply delivery.
 */
export function ContactForm({ locale }: { locale: Locale }) {
  const copy = getPublicSiteCopy(locale).contact;
  return (
    <div role="status" className="max-w-3xl border-s-4 border-gold bg-surface p-7 sm:p-9">
      <p className="text-lg leading-relaxed text-muted">{copy.status}</p>
    </div>
  );
}
