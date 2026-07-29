# Res Publica Design System

<!--
THESIS: Civic Observatory makes public work inspectable and refuses the generic
campaign homepage. Transparency is shown as provenance, bounded authority and
reversible choice.
OWN-WORLD: Mineral white, deep civic ink, observatory blue and verdigris;
optical glass layers; precise editorial type; hairlines, apertures and fields.
STORY: Understand the purpose, inspect the work, choose a responsible way to
participate.
FIRST VIEWPORT: A quiet institutional masthead floats over a full-width civic
field; the Satzung purpose and two human actions remain immediately legible.
FORM: Pinned replacement world - Civic Observatory, derived from the owner's
liquid-glass brief and the signed Satzung; no concept seed required.
-->

## Direction

**Civic Observatory** is a contemporary European institution expressed as a
place where public questions can be examined carefully. Its visual materials
come from optical instruments, archival sleeves, research tables and public
reading rooms: clear layers, calibrated spacing, precise labels and generous
light.

Liquid glass is functional. It identifies a surface that floats above content,
collects controls, reveals context or preserves a reversible preference. Long
reading, legal information and forms use stable opaque planes.

## Modes

- Public homepage and institutional landing pages: Persuade through evidence.
- Research, publications, projects and methodology: Read.
- Search, consent, forms, profile and dashboard: Operate.
- No surface uses campaign urgency or commercial conversion patterns.

## Colour

The light theme assumes a visitor reading in daylight in a library, office,
classroom or civic meeting space. The dark theme assumes the same work in an
evening reading environment.

- `civic-ink`: primary text and institutional depth.
- `mineral`: primary reading background.
- `glass`: translucent navigation and preference layers.
- `observatory`: actions, focus and active navigation.
- `verdigris`: research, evidence and constructive status.
- `amber`: cautious status and limited institutional emphasis.
- `critical`: errors only; never a brand field.

Every text/background pair must meet WCAG AA. Body copy targets AAA where the
palette permits it.

## Typography

- Figtree: navigation, body text, controls and operational interfaces.
- Source Serif 4: institutional statements, publication titles and measured
  display typography.
- Vazirmatn: all Persian text and headings.
- Display size never exceeds 6rem and uses at least `-0.04em` tracking.
- Reading measure is 65-75 characters; legal copy may be narrower.

## Shape and Depth

- Primary radius: 16px; compact controls: 12px; pills only for state or filters.
- Glass surfaces use one hairline plus a directional soft shadow. No glow.
- Content sections use fields, split planes and rules before cards.
- Cards are reserved for distinct resources or actions, never as default page
  scaffolding.
- Aperture motifs use circles and clipped fields only when they represent
  observation, relationship or focus.

## Layout

- Content width: 78rem maximum; reading width: 46rem maximum.
- Page gutters: `clamp(1rem, 4vw, 3rem)`.
- Section spacing: `clamp(4.5rem, 9vw, 8.5rem)`.
- Dense operational surfaces sit inside broad quiet fields.
- Logical properties and start/end alignment are mandatory for RTL safety.

## Motion

- One orchestrated optical reveal on the homepage: glass focus and content
  clarity resolve together.
- Route content remains visible before hydration.
- Hover motion is under 220ms and never moves text away from the pointer.
- `prefers-reduced-motion` and the local accessibility preference disable
  non-essential motion.
- No continuous animation, parallax, scroll hijacking or cursor effects.

## Components

- `CivicHeader`: sticky glass masthead with accessible desktop and mobile
  navigation.
- `CivicFooter`: institutional directory, contact and privacy controls.
- `GlassPanel`: bounded floating surface for controls or context.
- `InstitutionalHero`: purpose, proof and next action without marketing claims.
- `EvidenceRail`: source, status and maturity context.
- `CollectionFeature`: one primary item plus a calm indexed list.
- `FormField`: label, help, validation and consent state as one semantic unit.
- `ConsentBanner` and `PrivacyCenter`: equal accept/reject actions and granular
  reversible choices.
- `AccessibilityPanel`: text scale, contrast and motion preferences.
- `SearchWorkspace`: command-like search field with grouped, readable results.

## Content and Trust Rules

- State whether work is documented, experimental, operational or unavailable.
- Never imply a configured provider, partner or publication where none exists.
- Membership admission is a board decision, never an instant conversion.
- Private profile information is self-only and never indexed.
- HARM is described as a research project and developing methodology.
- RPCS / Civic School appears only as a programme.

## Responsive and RTL

- Mobile navigation is a focused full-height sheet, not a compressed desktop
  menu.
- Multi-column reading becomes one column before content narrows below 18rem.
- Glass blur degrades to an opaque surface when unsupported.
- Persian mirrors composition through logical layout rather than transformed
  screenshots or duplicated markup.

## Accessibility Floor

- WCAG 2.2 AA.
- Visible focus for every interactive control.
- Skip link, landmarks and one page-level heading.
- Minimum 44px pointer targets.
- Errors use text and programmatic association, not colour alone.
- Dialogs trap focus, restore focus and close on Escape.
- Consent and accessibility settings work without authentication.
