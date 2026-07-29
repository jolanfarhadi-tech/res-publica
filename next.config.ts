import type { NextConfig } from "next";

/**
 * Res Publica — Next.js configuration.
 *
 * NOTE ON PROJECT STRUCTURE:
 * This project uses ONE App Router tree: `src/app/[locale]`.
 * There must be NO root-level `app/` folder — if one exists,
 * Next.js silently uses it and ignores `src/app`, which causes
 * 404s. `npm run dev` / `npm run build` now guard against this
 * (see scripts/check-structure.mjs).
 */
const nextConfig: NextConfig = {
  // Keep canonical, hreflang, description, OpenGraph and JSON-linked metadata
  // in <head> for every crawler and audit client. All metadata is local/static,
  // so blocking it does not introduce a remote data dependency.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Production-safe fallback when an edge deployment does not invoke
      // locale middleware for the bare domain root.
      {
        source: "/",
        destination: "/de",
        permanent: false,
      },
      // Old URL kept alive: /de/mission → /de/mission-vision etc.
      {
        source: "/:locale(de|en|fa)/mission",
        destination: "/:locale/mission-vision",
        permanent: true,
      },
      // The former combined category now resolves to the first explicit
      // public category instead of remaining a primary information bucket.
      {
        source: "/:locale(de|en|fa)/offerings",
        destination: "/:locale/programs",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
