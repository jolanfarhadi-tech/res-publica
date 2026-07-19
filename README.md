# Res Publica — Website

Production website of Res Publica, a civic organization for
democracy, responsibility, dialogue, research, and public
participation. Trilingual: German (primary), English, Persian (RTL).

Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
Framer Motion · MDX content in Git · Vercel.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /de|/en|/fa
```

## Scripts

| Command                | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Dev server (runs the structure guard first)|
| `npm run build`        | Production build (guard + build)           |
| `npm run lint`         | ESLint                                     |
| `npm run typecheck`    | TypeScript, no emit                        |
| `npm run check-structure` | Verify single-router/content layout     |

## Environment variables

| Variable                | Required | Purpose                                  |
| ----------------------- | -------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | yes (prod) | Canonical URLs, sitemap, JSON-LD, RSS, OG |
| `NEWSLETTER_PROVIDER`   | optional | `buttondown` or `mailchimp`              |
| `BUTTONDOWN_API_KEY`    | if buttondown | Buttondown API token                |
| `MAILCHIMP_API_KEY`     | if mailchimp | Key ends in `-usXX` (datacenter)     |
| `MAILCHIMP_AUDIENCE_ID` | if mailchimp | Audience/list ID                     |

Without a configured provider the newsletter endpoint returns 503
and the form shows a localized "currently unavailable" message —
no fake successes. Mailchimp subscriptions are created as
`pending` (double opt-in); Buttondown handles confirmation itself.

## Content model (`src/content/`)

```
src/content/<locale>/pages/<slug>.mdx          static pages
src/content/<locale>/<collection>/<slug>.mdx   news | projects |
                                               research | publications | events
```

- German defines which entries exist; missing en/fa translations
  fall back to German automatically.
- Frontmatter is validated with Zod at build time: `title`,
  `description`, `date` (YYYY-MM-DD), `tags`, plus optional
  `location`/`endDate` (events), `authors`, `status`
  (`ongoing`/`completed`).
- Publishing = commit + push (Vercel redeploys). No CMS.

Team and partners are data files: `src/data/team.ts`,
`src/data/partners.ts`.

UI strings live in `src/i18n/dictionaries/{de,en,fa}.json` — all
three must keep the same key structure (TypeScript enforces it).

## Features

- **i18n**: `/de` `/en` `/fa` with locale middleware; Persian is
  fully RTL (logical CSS properties only) and uses the Solar
  Hijri calendar for dates.
- **Search**: `/{locale}/search` — a per-locale JSON index is
  generated at build time (`/{locale}/search-index.json`) and
  searched client-side (debounced, ranked, Persian-aware
  normalization). Search pages are `noindex`.
- **News**: fifth content collection; included in RSS, sitemap,
  and search automatically.
- **Newsletter**: `POST /api/newsletter` with provider adapters
  (Buttondown, Mailchimp), server-side keys, honeypot.
- **SEO**: canonical + hreflang (de/en/fa/x-default) on every
  page, JSON-LD (Organization, Article, Event, Person,
  BreadcrumbList), `sitemap.xml`, `robots.txt`, per-locale RSS,
  generated OG images.
- **Accessibility**: WCAG AA — token contrast verified
  programmatically in both themes, skip link, focus management,
  `aria-current` navigation, live regions, reduced-motion support.
- **Theming**: light/dark/system, CSS variables, no flash.

## CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push/PR to `main`:
structure guard → `npm run lint` → `npm run typecheck` →
`npm run build`.

## Deployment (Vercel)

1. Import the GitHub repo (framework auto-detected; `vercel.json`
   pins it).
2. Set the environment variables above for Production (at minimum
   `NEXT_PUBLIC_SITE_URL=https://your-domain`).
3. Deploy. Then verify: `/sitemap.xml`, `/robots.txt`,
   `/de/rss.xml`, a detail page in Google's Rich Results Test,
   and submit the sitemap in Google Search Console.

Security headers (nosniff, frame-deny, referrer policy,
permissions policy) are set globally in `next.config.ts`.

## Project structure rules

One App Router tree: `src/app/[locale]`. One content tree:
`src/content`. The guard (`scripts/check-structure.mjs`) fails
any dev/build where a duplicate root `app/` or `content/` folder
appears — that state causes silent 404s/empty pages.

## License

The Res Publica core software is licensed under the GNU Affero General
Public License, version 3 only (`AGPL-3.0-only`). See [LICENSE](LICENSE).

Res Publica reserves the option, to the extent it holds the necessary
rights, to offer the software under separate terms (dual licensing).
Contributions require a Contributor License Agreement (CLA). Until the
CLA text is published, contributions are accepted only by prior
arrangement; see [CONTRIBUTING.md](CONTRIBUTING.md).
