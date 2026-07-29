import type { Locale } from "@/i18n/config";
import type { PublicCategory } from "@/data/public-offerings";
import { getPublicSiteCopy } from "@/i18n/public-site";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { OfferingMatrix } from "./OfferingMatrix";

export function PublicCategoryPage({
  locale,
  category,
}: {
  locale: Locale;
  category: PublicCategory;
}) {
  const copy = getPublicSiteCopy(locale).categories[category];

  return (
    <>
      <PageHeader title={copy.title} lede={copy.lede} />
      <Container className="section-shell">
        <section aria-labelledby={`${category}-maturity`}>
          <h2 id={`${category}-maturity`} className="mb-10 text-4xl sm:text-5xl">
            {getPublicSiteCopy(locale).offerings.maturityTitle}
          </h2>
          <OfferingMatrix locale={locale} category={category} />
        </section>
      </Container>
    </>
  );
}
