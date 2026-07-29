# Res Publica Website Design System

## Direction: Civic Observatory

The public website presents Res Publica as a calm European civic institution:
precise enough for research, open enough for dialogue, and accountable enough
for public trust. The interface combines editorial typography, observatory-like
circles and grids, mineral surfaces, and restrained translucent layers.

This is not a commercial product aesthetic. It avoids growth language,
gamification, unsupported social proof, stock imagery, and decorative
dashboards.

## Typography

- **Source Serif 4** carries institutional headings and long-form emphasis.
- **Figtree** carries body text, navigation, forms, metadata, and controls.
- **Vazirmatn** carries Persian text and headings with native RTL shaping.
- Display sizes use fluid `clamp()` scales; body copy remains readable at
  1rem or larger with generous line height.
- Core content never depends on web-font loading to remain visible or usable.

## Color and surfaces

- **Mineral white / paper**: primary reading surfaces.
- **Deep civic ink / night**: institutional hero and high-emphasis sections.
- **Observatory blue**: links, focus, and primary action.
- **Verdigris**: verified state and quiet institutional emphasis.
- **Signal brass**: sparse editorial indexing only.

Glass is functional, not ornamental. It marks layered controls, consent,
status, and selected editorial surfaces. Reduced-transparency preferences
replace it with solid surfaces.

## Spacing and shape

- Section rhythm is defined by `--section` and scales by viewport.
- Reading widths remain bounded even on wide displays.
- Cards use 1.25–1.5rem radii; controls use 0.75rem radii.
- Hairline rules and whitespace establish hierarchy before shadows do.
- Touch targets are at least 44px.

## Motion

Framer Motion provides one quiet, one-time settle animation. Content renders
visibly before hydration and remains visible when animation or JavaScript is
unavailable. `prefers-reduced-motion` and the local accessibility preference
remove non-essential motion.

## Accessibility and preferences

- WCAG 2.2 AA contrast and visible `:focus-visible` treatment.
- Keyboard-operable header, mobile menu, dialog, forms, and settings.
- Semantic headings, landmarks, labels, live regions, and error associations.
- Local controls for reduced motion, higher contrast, and larger text.
- Necessary local storage is always available; functional, analytics, and
  newsletter categories are off until explicit consent.
- The preference layer does not itself load analytics or third-party scripts.

## Responsive and RTL rules

- Layouts begin as one column and expand only when content width permits.
- At narrow widths the wordmark contracts to the RP seal so controls never
  force horizontal overflow.
- The mobile menu is an opaque, full-height layer below the sticky masthead.
- Logical `start`/`end` properties govern spacing and borders.
- Persian uses `lang="fa"`, `dir="rtl"`, Vazirmatn, mirrored observatory
  composition, and localized dates.

## Core components

- Sticky institutional masthead and responsive navigation.
- Editorial page headers and collection reading templates.
- Glass and solid cards with restrained hover feedback.
- Primary, secondary, and quiet action styles.
- Provenance-gated project, publication, research, event, and news entries.
- Consent banner, preference center, and privacy dashboard.
- Accessible membership, event-registration, and newsletter forms.
- Protected Member Profile status panels.

## Governance constraints

- No engagement scores, ranks, points, streaks, or competitive badges.
- No invented people, partners, projects, publications, impact figures,
  testimonials, or launched capabilities.
- HARM is a research project and methodology in development, never a product.
- RPCS / Civic School and Civic Fellowship are programmes, never products.
- Publishing Authority remains an internal human-accountability boundary.
- Backend, authentication, persistence, and audit contracts are unchanged.

## Sources

The design and copy are grounded in the signed Satzung supplied for this
release review, `brain/00_constitution/00_constitution.md`,
`docs/source/foundation/`, `docs/source/methodology/`,
`docs/source/projects/`, and the existing accepted repository boundaries.
The signed PDF is not copied into the repository because it contains
signatures and personal data.
