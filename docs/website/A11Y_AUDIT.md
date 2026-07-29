# Accessibility and Performance Audit

**Date:** 2026-07-29

**Build target:** `NEXT_PUBLIC_SITE_URL=https://respublica-ev.de`

## Automated result

Lighthouse 13.0.1 ran against the local optimized production build in
headless Microsoft Edge.

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Desktop `/de` | 100 | 100 | 100 | 100 |
| Mobile `/de` | 95 | 100 | 100 | 100 |

The final mobile sample reported FCP 1.6s, LCP 2.7s, TBT 100ms, and CLS 0.
The desktop sample reported FCP 0.4s, LCP 0.7s, TBT 10ms, and CLS 0.
Windows occasionally reported an Edge temporary-profile cleanup warning after
writing a complete Lighthouse JSON report; this did not affect the audit data.

## Rendered verification

- The document language and direction are `de|en|fa` and Persian uses
  `dir="rtl"`.
- German and Persian hero headings remain inside a 375px content viewport.
- No horizontal overflow is present at 375px.
- The desktop hamburger is hidden at 1265px.
- The mobile menu is a native modal dialog: background content is inert,
  focus enters the dialog, Escape/close restores the trigger, and body
  scrolling is locked while open.
- Core homepage content is server-rendered and never hidden before hydration.
- Framer Motion is reserved for the Lab route and respects both the operating
  system preference and the website's local reduced-motion setting.
- Necessary, functional, analytics, newsletter, reduced-motion,
  high-contrast, and larger-text controls are keyboard operable.
- Optional consent starts disabled; accept and reject actions have equal
  visual weight.
- Membership, event, and newsletter consent notices link directly to the
  localized privacy policy.
- Visible focus, semantic landmarks, labels, live regions, and error
  associations remain present.
- A fresh production browser tab produced no console warning or error.

## Performance decisions

- Homepage entrance effects were removed from the long primary narrative,
  reducing first-load JavaScript from 142kB to 106kB.
- Framer Motion remains on the dedicated Lab experience.
- Off-screen sections use `content-visibility: auto` with an intrinsic-size
  fallback to avoid initial layout work.
- Web fonts use `display: optional`, preserving readable system fallbacks and
  eliminating layout shift.
- CSS remains cacheable rather than enabling Next.js's experimental,
  production-discouraged global CSS inlining.
