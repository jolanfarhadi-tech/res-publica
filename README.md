# Res Publica — Website

Modern, multilingual website for the civic organization Res Publica.
German (primary) · English · Persian (RTL).

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — you will be redirected to your
language (or /de). Try /de, /en and /fa, and the theme toggle.

## Milestone 4 — full home page & polish

- **Home** now pulls real content at build time: 3 featured
  projects, latest research (3), latest publications (3), and up
  to 3 upcoming events — each section with a "view all" link and
  hidden automatically when empty.
- **Content location**: `src/content/<locale>/...` is canonical;
  a root `content/` folder still works as a fallback, but never
  keep both (the structure guard will stop the build if you do).
- **Full footer** with grouped sitemap (Organization / Our work).
- **Full desktop navigation** including Events and Team; the URL
  and label are now "Mission & Vision" (`/mission-vision`).
- **Motion polish**: staggered fade-ups per section, gentle hover
  lift on all cards. Everything respects `prefers-reduced-motion`.
- **Localized 404**: middleware passes `x-locale` to
  `not-found.tsx`; a catch-all route makes unknown paths like
  `/de/xyz` render the localized 404 inside the normal layout.
- **Brand assets**: `src/app/icon.svg` (favicon) and a generated
  per-locale Open Graph image (`opengraph-image.tsx`) — shared
  links show a branded card with the localized tagline.
- Set `NEXT_PUBLIC_SITE_URL` in Vercel (Project → Settings →
  Environment Variables) to the production URL so OG links
  resolve to the right domain.

## Milestone 3 — dynamic content collections

- **Four collections** under `content/<locale>/<collection>/`:
  `projects`, `research`, `publications`, `events`. Slugs are
  defined by the German folder; missing translations fall back
  to German (`src/lib/collections.ts`).
- **Frontmatter** (validated by Zod): `title`, `description`,
  `date` (YYYY-MM-DD), `tags`, plus optional `location`/`endDate`
  (events), `authors` (research/publications), `status`
  (`ongoing`/`completed`, projects).
- **Index pages** share `CollectionIndex`: tag filter (`?tag=`)
  and pagination (`?page=`, 9 per page) live in the URL — no
  client JS, filtered views are shareable. Events split into
  upcoming (soonest first) and past.
- **Detail pages** share `CollectionDetail`: metadata block,
  MDX body, related entries (shared tags), back link.
- **Dates** are locale-aware (`src/lib/dates.ts`): Persian pages
  automatically show the Solar Hijri calendar with Persian digits.
- All sample entries are PLACEHOLDER content — replace or delete.

### Adding an entry

Copy an existing `.mdx` file in `content/de/<collection>/`, adjust
the frontmatter and text, and (ideally) add the `en`/`fa` versions
with the same filename. Commit and push.

## Milestone 2 — content architecture & static pages

- **MDX content in Git**: `content/<locale>/pages/<slug>.mdx` with
  frontmatter validated by Zod (`src/lib/content.ts`). Missing
  translations fall back to German instead of breaking.
- **Pages**: About and Mission (MDX-driven via `MdxPage`), Team and
  Partners (data-driven from `src/data/*.ts` — replace the
  placeholder entries), Contact (accessible form UI; backend
  wiring comes in a later milestone).
- New components: `PageHeader`, `PersonCard`, `MdxPage`,
  `ContactForm`; `Prose` now styles MDX output.
- New dependencies — run `npm install` once after pulling:
  `next-mdx-remote`, `gray-matter`, `zod`.

### Editing content

Open `content/de/pages/about.mdx`, change the text, commit, push —
Vercel redeploys automatically. Same for `en` and `fa`.

## Milestone 1 — what exists

- **Design tokens** in `src/app/globals.css` (light + dark palettes,
  fonts, focus styles). Components only use semantic Tailwind
  classes like `bg-bg`, `text-ink`, `text-accent`, `border-border`.
- **i18n**: locale routing under `/[locale]`, dictionaries in
  `src/i18n/dictionaries/*.json`, RTL for Persian via `dir="rtl"`.
- **Layout**: Header (sticky, mobile menu), Footer, skip link,
  three-state theme toggle (system / light / dark, no flash).
- **UI kit**: Container, Button, Card, SectionHeading, Prose,
  FadeIn (Framer Motion, respects reduced motion).
- **Home skeleton** proving the system in all three languages.

## Conventions

- Use logical spacing utilities (`ms-`, `me-`, `ps-`, `pe-`,
  `start-`, `end-`) instead of `ml-`/`mr-` so layouts mirror
  correctly in Persian.
- All user-facing strings live in the dictionaries — never
  hard-code text in components.

## Next milestones

2. Content architecture (MDX) & static pages
3. Projects / Research / Publications / Events
4. Full home page & motion polish
5. SEO & accessibility hardening
6. Search, newsletter, CI, Vercel deployment
