import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Footer — tagline and copyright. The full sitemap and legal
 * links (Impressum, privacy) arrive with Milestone 2.
 */
export function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-2 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif tracking-[0.18em]">
          RES<span className="text-gold">·</span>PUBLICA
        </p>
        <p className="text-sm text-muted">{dict.footer.tagline}</p>
        <p className="text-sm text-muted">
          © {year} Res Publica. {dict.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
