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
    ];
  },
};

export default nextConfig;
