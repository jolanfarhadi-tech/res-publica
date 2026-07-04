import Link from "next/link";
import { Container } from "@/components/ui/Container";

/**
 * Minimal trilingual 404 inside the locale layout.
 * Milestone 2 replaces this with a fully localized page.
 */
export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="text-5xl">404</h1>
      <p className="mt-4 text-muted">
        Seite nicht gefunden · Page not found · صفحه پیدا نشد
      </p>
      <p className="mt-8">
        <Link href="/" className="text-accent underline underline-offset-4">
          Res Publica
        </Link>
      </p>
    </Container>
  );
}
