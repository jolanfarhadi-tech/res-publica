const PUBLIC_CONTENT_PATTERN =
  /(?:^|\/)content\/(de|en|fa)\/(news|projects|research|publications|events|pages)\/([a-z0-9-]+)\.mdx$/;

export type PublicContentSource = {
  locale: "de" | "en" | "fa";
  url: string;
};

export function publicContentSource(file: string): PublicContentSource | null {
  const match = file.replaceAll("\\", "/").match(PUBLIC_CONTENT_PATTERN);
  if (!match) return null;
  const [, locale, section, slug] = match;
  const url =
    section === "pages"
      ? `/${locale}/${slug}`
      : `/${locale}/${section}/${slug}`;
  return { locale: locale as PublicContentSource["locale"], url };
}
