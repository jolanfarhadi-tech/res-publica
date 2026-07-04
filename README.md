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
