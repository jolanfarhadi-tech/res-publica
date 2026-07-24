# Accessibility Audit

**Date:** 2026-07-24

**Release candidate:** frontend working tree based on `09c160bb7e56a7bd9e5b9039e2f12de49ae727bf`

**Production URL used for metadata/build configuration:** `https://respublica-ev.de`

## Result

No release-blocking accessibility defect was found.

| Page | Lighthouse accessibility |
| --- | ---: |
| `/de` | 96 |
| `/en` | 96 |
| `/fa` | 96 |
| `/de/method` | 100 |
| `/de/offerings` | 100 |
| `/de/membership` | 100 |

Lighthouse 13.4.1 ran against the local production build with Microsoft Edge in headless mode.

## Verified safeguards

- One visible `h1` is present on each localized homepage.
- The root document uses `lang="de|en|fa"` and `dir="rtl"` for Persian.
- The skip link, semantic navigation labels, current-page state, menu expanded state, form status regions, and field error associations are present.
- Keyboard opening and closing of the mobile menu, Escape handling, and focus return were checked.
- The constellation is decorative to assistive technology and has an adjacent textual equivalent.
- Global `:focus-visible` and `prefers-reduced-motion: reduce` rules remain active.
- Responsive Persian pages were checked without horizontal overflow.
- The tested foreground/background combinations meet WCAG AA contrast requirements.

## Non-blocking follow-up

- Repeat the Lighthouse sample and a Persian screen-reader pass after future design-token or navigation changes.
