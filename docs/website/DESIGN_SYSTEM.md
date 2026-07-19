# Res Publica Website Design System

## Direction

The visual language is **Civic Editorial Monument**: a contemporary public
institution expressed through strong typography, architectural spacing,
editorial rules, and restrained contrast. It avoids startup gradients,
consultancy imagery, decorative dashboards, and generic rounded-card systems.

## Typography

- Fraunces carries institutional display headings in German and English.
- Vazirmatn carries Persian text and headings without forcing a Latin display
  face onto Arabic script.
- Inter carries navigation, metadata, controls, and body copy.
- The homepage hero uses a fluid `clamp()` scale from 3.5rem to 8.75rem.
- Body copy remains between 1rem and 1.25rem with generous leading.

## Spacing Rhythm

- Primary page sections: 5rem mobile, 7rem desktop.
- Hero: viewport-based height with 2.5–4rem internal edges.
- Editorial modules: 1.5–2.25rem vertical rhythm.
- Hairline rules separate content; whitespace, not boxes, creates hierarchy.

## Surface Hierarchy

1. Institutional Night (`--night`) — hero, major project narrative, final CTA.
2. Editorial Paper (`--paper`) — thesis, research, and publication reading plane.
3. Site Background (`--bg`) — operational and foundation sections.
4. Deep Civic Blue (`--deep-blue`) — participation and membership invitation.
5. Signal Brass (`--signal`) — indices and quiet institutional emphasis only.

Core text/background combinations are selected to exceed WCAG AA. Existing
semantic light/dark tokens remain the default for all non-homepage routes.

## Visual Motifs

- Fine architectural grid in the hero.
- Oversized translucent “R” as a typographic institution mark, not an image.
- Two-digit editorial indices for narrative orientation.
- Rules, columns, and asymmetric editorial proportions instead of card stacks.
- The Res Publica wordmark combines a compact RP seal with the full name.

## Motion

- One restrained fade-and-rise entrance pattern using the existing Framer
  Motion component.
- Short duration, one-time viewport entry, no parallax or continuous movement.
- `prefers-reduced-motion` removes meaningful animation duration globally.

## Responsive and RTL Rules

- Mobile starts as a single editorial column; two- and three-column structures
  enter only when content width permits.
- Desktop navigation uses a dedicated second row to prevent horizontal overflow.
- Mobile navigation is a full-width institutional panel with large targets.
- Layout uses logical `start`/`end` and `border-e` utilities; no directional
  spacing is introduced.
- Persian inherits `dir="rtl"` from the locale layout and uses a mirrored hero
  light field plus Vazirmatn typography.

## Component States

- Header: sticky, translucent background, desktop two-tier and mobile panel.
- CTA: solid paper-on-night primary; transparent bordered secondary.
- Editorial entry: rule-separated link with date, title, description, metadata.
- Collection emphasis: feature entry plus compact supporting entries.
- Theme, search, account, and language controls preserve existing behavior and
  visible focus treatment.

## Governance Constraints

- No engagement scores, ranks, badges, or competitive visual language.
- No fabricated statistics, testimonials, partners, awards, or case studies.
- No distress imagery or sensational treatment.
- Existing anonymous access, locale routing, RTL behavior, and backend flows
  remain unchanged.

## References

`brain/00_constitution/00_constitution.md`;
`docs/source/foundation/00_MANIFESTO.md`;
`docs/source/foundation/03_VALUES.md`;
`docs/source/foundation/06_ECOSYSTEM.md`;
`src/app/globals.css`.
