import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="flex h-16 items-center justify-center text-sm text-muted">
        <p>
          &copy; {new Date().getFullYear()} {dict.meta.title} &mdash; {dict.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
