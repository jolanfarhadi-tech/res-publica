# Architectural shell release — 2026-09-20

## Scope and authorization

The owner approved the latest preview and explicitly requested deployment in
German, English and Persian. This release preserves that approved revision;
it does not claim the cinematic reference quality has been achieved.

- One default architectural shell on `/de`, `/en` and `/fa`, without a query flag.
- Persistent 3D room views for public routes; quiet static views for account,
  form and legal routes, with normal accessible HTML controls.
- Indoor flags are static draped cloth, with no wind animation.
- Old hero/orbit treatments are no longer mounted by the home page. Historic
  source/assets remain recoverable; no posts, member data or content are deleted.
- Fonts and architectural assets are self-hosted. Asset licenses and source
  manifests accompany the release. No paid service was activated.
- Authentication, database schema, permissions and content are not changed.

## Evidence recorded before publication

- [x] 77 focused scene, motion, UI and public-boundary tests passed.
- [x] TypeScript check passed.
- [x] Repository-wide ESLint passed.
- [x] `git diff --check` passed.
- [ ] Complete repository test suite: local run interrupted after two backend
  integration failures. Both failed cases passed in the isolated reproduction;
  require the full CI run before promotion.
- [x] Isolated production build: exit 0, 173 generated pages, including all
  three locales. Result: `C:/Users/alblo/AppData/Local/Temp/res-publica-build-1L5qJG/build-result.json`.
  No `.env` or credentials copied.
- [ ] CI and preview deployment for the exact release commit.
- [x] Local HTTP, language/direction and main-page smoke checks in DE/EN/FA:
  all 33 route checks passed using `scripts/check-architectural-release.mjs`.
- [ ] Production deployment and verification on `respublica-ev.de`.

Unchecked items are not completed claims. Build/test results and URLs must be
recorded as they become available. The unrelated local PDF is excluded.

The GitHub connector cannot create pull requests (403); the existing release
branch therefore also runs the same CI on push. This adds coverage without
disabling any check or changing the production branch. Production remains `main`.

## Performance and accessibility boundaries

Keep HTML readable before and without WebGL. Respect reduced motion, stop the
camera while using forms and when the tab is hidden, and stop rendering when
the camera settles. Raster output is bounded to 1.65 million pixels; desktop
reflection is disabled on smaller/low-concurrency devices. Heavy 3D code is
dynamically imported and protected routes do not initially request it.

Target budgets remain LCP < 2.5 seconds, CLS < 0.1 and INP < 200 ms. No new field
measurement proves those targets for this release; CPU submission time must
not be reported as GPU frame time or sustained FPS. Photoreal humans, UN/UNESCO
flags and recognizable board likenesses remain outside the delivered evidence.

## Deployment and recovery

Use the existing GitHub repository and Vercel project `res-publica`, with the
existing custom domain. Do not create a replacement project or change secrets.
Keep the previous production deployment available for rollback. If route,
form, font or 3D loading checks fail, do not promote the preview. A rollback
restores the prior known-good Vercel deployment; it must not delete content.
