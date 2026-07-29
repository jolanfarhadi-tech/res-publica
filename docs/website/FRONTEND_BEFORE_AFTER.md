# Frontend Before / After

## Before

- A strong editorial narrative existed, but the visual system was split
  between older semantic components and a homepage-specific treatment.
- HARM was absent from the public project collection because no reviewed,
  provenance-gated entry existed.
- The Lab had no dedicated public route.
- Privacy was limited to legal text; there was no consent preference center,
  privacy dashboard, or accessibility preference UI.
- Membership and event actions lacked explicit local consent confirmation in
  the frontend.
- Mobile controls could become dense as navigation expanded.
- Entrance motion could temporarily hide content before hydration.

## After

- One Civic Observatory system now governs the homepage, collections, public
  category pages, search, forms, team cards, legal reading, and protected
  profile/status UI.
- The homepage carries the full institutional story and all required public
  sections without unsupported claims.
- HARM is a reviewed, sourced research project in DE/EN/FA and remains outside
  Products.
- `/[locale]/lab` presents the research and innovation environment, including
  AI governance, digital ethics, methods in development, institutional
  innovation, and future research.
- `/[locale]/privacy` plus the consent dialog provide local, multilingual,
  accessible control over optional categories and presentation preferences.
- Membership, event registration, and newsletter interfaces require explicit
  privacy consent while preserving their existing API payloads.
- Membership terminology distinguishes statutory membership classes from
  other participation relationships.
- The header contracts safely on narrow viewports; Persian is RTL without
  horizontal overflow.
- Core information is visible before hydration and with reduced motion.
- Organization, Event, Article, and Breadcrumb structured data remain
  integrated with canonical and language-alternate metadata.

## Intentionally unchanged

- Backend logic, API contracts, authentication, database schema, migrations,
  audit semantics, and Publishing Authority behavior.
- Existing route addresses and the DE/EN/FA locale architecture.
- Provenance gates, private Member Profile behavior, and truthful empty states.
- Unverified people, partners, publications, events, and claims remain absent.
