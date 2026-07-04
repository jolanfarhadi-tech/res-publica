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
  async redirects() {
    return [
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
