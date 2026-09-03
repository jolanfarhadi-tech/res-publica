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
- **Res Publica blue, red and gold**: the official identity palette recovered
  from the supplied RGB logo assets. Blue carries institutional structure, red
  is used sparingly for civic emphasis, and gold marks the central signal.
- **Verdigris**: verified state and quiet institutional emphasis.
- **Signal brass**: sparse editorial indexing only.

Glass is functional, not ornamental. It marks layered controls, consent,
status, and selected editorial surfaces. Reduced-transparency preferences
replace it with solid surfaces.

## Official mark

The web identity uses the supplied official RGB artwork rather than a recreated
text mark. The horizontal lockup appears in the masthead and footer; the mark
alone is reserved for compact layouts and structured metadata. CMYK and print
files remain source assets and are not served to browsers. The logo is not
recoloured, redrawn, animated or placed over visually noisy imagery.

## Civic forum hero

The homepage translates the mark into a three-dimensional civic environment:
a red outer U, four upright nested blue channels, a continuous vertical centre
axis and a restrained amber signal. The long near-parallel sides and rounded
lower returns follow the mark rather than generic semicircular parliamentary
seating. A narrow civic lectern sits on the longitudinal centre axis as the
place where an account becomes publicly answerable; it does not become the
wide horizontal committee-table hierarchy rejected by the composition. The
render contains no words, logos, portraits or institutional claims.
All names, metrics and navigation remain semantic HTML so they can be
localized, audited, indexed and read by assistive technology.

The current forum web asset is
`public/brand/res-publica-civic-forum-glass-lab-v5.webp` (1536 × 1024, 295 KB),
generated from the prior mark-faithful forum as a strict geometry reference.
It preserves the red outer U, four upright nested blue channels, centre axis
and narrow lectern while turning the empty surround into a transparent,
materially believable civic research laboratory. Synthetic, non-identifiable
adults now appear at credible scale in listening, document-review and
collaborative-research situations rather than as miniature figurines. Every
person stands on the floor or uses a visible chair and worktable; nobody sits
on the coloured structural bands or glass partitions. Glass
partitions, restrained research surfaces, daylight and reflections provide a
humanitarian working environment without sci-fi interface effects. This is an
architectural visualization, not a documentary image of a real facility,
hearing, participant or project. The three supplied team illustrations are
layered separately and remain decorative; public names and roles come from
`src/data/team.ts`.

The same visualization also forms a fixed, restrained architectural field
behind the public site. It is intentionally softened and partially veiled by
the page surface, while headings and interactive content sit on accessible
glass layers. This creates the sense of looking into the institution rather
than placing an unrelated illustration beside the copy. Dark, high-contrast
and reduced-transparency modes preserve legibility and do not depend on the
image for meaning.

The amber focal object is a transparent 640 × 640 WebP render with more than
twenty unequal crystalline planes, internal refraction and deep bronze shadow
facets. It replaces both the star-shaped CSS polygon and the flatter faceted
SVG. The raster supplies believable material depth while CSS provides a slow
float, restrained three-axis turn and orbit pulse above the lectern; all motion
stops under the user's reduced-motion preference.

The first team crops inherited connector lines, compression halos and fragments
from the owner reference. They were first superseded by cleaned navy line
portraits and are now replaced by the `*-v3.webp` set: three 800 × 800 coloured
editorial illustrations derived from the owner-supplied identity references.
Natural facial colour, restrained navy/coral clothing and a shared warm-grey
field preserve recognisability without presenting the assets as documentary
photographs. The source screenshots and real photographs are not runtime
assets.

Depth is structural rather than an applied glass effect: the hero establishes
a perspective field, the civic forum and portraits occupy separate depth
planes, the institutional snapshot overlaps the forum plane, gateway cards
respond within a bounded perspective, and the ecosystem field uses restrained
spatial rotation. Reduced-motion mode removes transforms without changing
information hierarchy.

The ecosystem field uses a cybernetic visual grammar rather than a flat
platform inventory. Two counter-moving closed feedback loops surround the
institutional core; directional channels, sensing junctions and slow signal
pulses show information moving inward and responsibility returning outward.
The four platform cards remain bounded and separately named. The six visible
principles—research, dialogue, participation, evidence, responsibility and
repair—come from verified localized copy. Reduced-motion mode stops the loops
and removes moving signal particles while preserving every label and boundary.

The platform visualization uses the complete supplied horizontal identity,
not a cropped or reconstructed mark. Four bounded platform cards sit on a
layered connection field with distinct routes, junctions and orbit planes.
Movement is decorative and reduced-motion safe; the localized platform names
and scopes remain semantic HTML rather than being embedded in the graphic.

The homepage institutional snapshot uses owner-confirmed static figures. It is
explicitly labelled as a confirmed snapshot rather than a live counter. New or
changed figures require renewed owner confirmation; collection previews remain
independently provenance-gated by `visibility`, `reviewed` and `source`.

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
- The HARM Operating System is the methodology; the HARM Platform is the
  separate Governance Domain execution environment; the HARM Research Project
  researches and develops it. None is presented as a commercial product.
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
