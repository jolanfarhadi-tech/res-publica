import type { Metadata } from "next";
import { Figtree, Source_Serif_4, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { getDirection, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PreferenceProvider } from "@/components/privacy/PreferenceProvider";
import "../globals.css";

/* Brand fonts, self-hosted by next/font (no external requests). */
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "optional",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "optional",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "optional",
});

/* Pre-render one page tree per language at build time. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    // Set NEXT_PUBLIC_SITE_URL in Vercel to the production domain.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.meta.title}`,
    },
    description: dict.meta.description,
    openGraph: {
      type: "website",
      siteName: dict.meta.title,
      title: dict.meta.title,
      description: dict.meta.description,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

/**
 * Runs before React hydrates, so the correct theme is applied
 * with no "flash" of the wrong colors. Reads the saved choice
 * ("light" / "dark") or falls back to the system preference.
 */
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var theme =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const dir = getDirection(locale as Locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${figtree.variable} ${sourceSerif.variable} ${vazirmatn.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Skip link: first focusable element on every page (WCAG 2.4.1). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast"
        >
          {dict.a11y.skipToContent}
        </a>
        <PreferenceProvider locale={locale as Locale}>
          <Header locale={locale as Locale} dict={dict} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer locale={locale as Locale} dict={dict} />
        </PreferenceProvider>
      </body>
    </html>
  );
}
