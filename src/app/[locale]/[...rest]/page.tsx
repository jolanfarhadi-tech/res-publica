import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths under a locale, e.g. /de/xyz.
 * It immediately triggers the nearest not-found boundary, so the
 * visitor sees the localized 404 inside the normal site layout.
 */
export default function CatchAll(): never {
  notFound();
}
