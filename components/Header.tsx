import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";

const NAV_ITEMS = [
  { slug: "", key: "home" },
  { slug: "about", key: "about" },
  { slug: "mission-vision", key: "missionVision" },
  { slug: "projects", key: "projects" },
  { slug: "research", key: "research" },
  { slug: "publications", key: "publications" },
  { slug: "events", key: "events" },
  { slug: "team", key: "team" },
  { slug: "contact", key: "contact" },
] as const;

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="border-b border-border bg-background">
      <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3">
        <Link href={`/${lang}`} className="text-lg font-semibold tracking-tight">
          {dict.meta.title}
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-2 sm:order-none sm:w-auto">
          {NAV_ITEMS.map(({ slug, key }) => (
            <Link
              key={key}
              href={slug ? `/${lang}/${slug}` : `/${lang}`}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {dict.nav[key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher currentLocale={lang} label={dict.header.languageLabel} />
          <ThemeToggle
            toggleThemeToDarkLabel={dict.header.toggleThemeToDark}
            toggleThemeToLightLabel={dict.header.toggleThemeToLight}
          />
        </div>
      </Container>
    </header>
  );
}
