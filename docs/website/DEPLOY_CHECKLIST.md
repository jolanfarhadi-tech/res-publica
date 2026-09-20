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
- [x] Complete repository test suite: 559 tests in 130 files passed in CI.
  The two earlier local failures did not recur in isolated reproduction or CI.
- [x] Isolated production build: exit 0, 173 generated pages, including all
  three locales. Result: `C:/Users/alblo/AppData/Local/Temp/res-publica-build-1L5qJG/build-result.json`.
  No `.env` or credentials copied.
- [x] CI and Vercel preview build for release commit
  `34aeb995e33e13ae3479e48d7e2451708fc06c19` succeeded.
  CI: https://github.com/jolanfarhadi-tech/res-publica/actions/runs/35538259481
  Preview: https://res-publica-d7oeo23hx-res-publica1.vercel.app
  Anonymous preview checks redirect to Vercel login; protection was not changed.
- [x] Local HTTP, language/direction and main-page smoke checks in DE/EN/FA:
  all 33 route checks passed using `scripts/check-architectural-release.mjs`.
- [x] Production deployment and verification on `respublica-ev.de`: Vercel
  deployment `C1perqdDo8kTf6iJZyiN9MGSBvZN` succeeded for release
  `34aeb995e33e13ae3479e48d7e2451708fc06c19`.
  All 33 production route checks passed (HTTP 200, correct language/direction,
  new architectural shell, visible page content and no legacy home hero).
  The main HDR, human model, Lion-and-Sun texture, plant geometry and liveness
  endpoint also returned HTTP 200. No production forms were submitted.

After the successful CI run, the exact release commit was fast-forwarded to
`main` under the owner's explicit deployment approval. No force push was used.
Local browser checks covered German home, English publications, Persian research
and switching research from Persian to English while preserving the route.
No horizontal overflow was observed in those views. The 3D scenes reported ready;
initial scene timings are not a performance acceptance claim.

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

## Camera/mobile correction — 2026-09-20 (published 2026-09-21)

- Replaced scroll-triggered, repeatedly interrupted room tours with bounded
  atrium movement. Route changes use a short dissolve between authored views.
  Hidden tabs and focused forms pause motion; settled views stop rendering.
- Mobile has a framed architectural opening, a stable camera, readable content
  below it, a full wordmark and compact three-column statistics. Smaller render
  targets omit reflection and ambient-occlusion passes.
- Removed retired image backgrounds from the initial shell, participation,
  footer and inner-page headers, including their hidden image requests. Content,
  participation links, forms and all three languages are preserved.
- Research/library cameras are elevated establishing views, over ten metres
  from the workspace occupants. This is not a claim that the human assets have
  become photorealistic.

Verified locally:

- 85 focused tests in 12 files; TypeScript, scoped ESLint and diff checks passed.
- Isolated production build passed: 173 pages. Evidence:
  `C:/Users/alblo/AppData/Local/Temp/res-publica-build-X82KvU/build-result.json`.
- All 33 DE/EN/FA route checks passed.
- Browser checks at 375, 390, 768 and 1440 pixels: no horizontal overflow in
  checked home/research views. Language switching preserved the research route.
- WebGL reached ready on the inspected mobile and desktop views. Mobile scroll
  left the camera/frame count unchanged. Desktop home progressed from
  `2.40,6.15,13.60` to `-1.80,6.10,13.60` and settled. Research navigation resolved
  to the authored view without travelling through the building.
- Reduced-motion preference held the camera still; the original setting was
  restored. No browser error logs were observed in the inspected views.
- No retired hero/header background image elements remained in inspected pages.

Not proven: real-device iOS/Safari performance, slow-network loading budgets,
field Core Web Vitals or a pixel-baseline visual regression. Desktop viewport
emulation is not a substitute for testing an actual phone.

Remote validation for correction commit `4115e5d0983e0d2fdd632337d7e742c0dd090eeb`:

- CI passed: 567 tests in 131 files, repository-wide lint/type checks, security,
  database migration checks and production build.
  https://github.com/jolanfarhadi-tech/res-publica/actions/runs/35540228462
- Primary Vercel preview succeeded:
  https://res-publica-dewpyijwg-res-publica1.vercel.app
  Deployment: `EorvUpejH4XuqTzmcjhqeR9qmGqf`.
- Anonymous requests for all three locale preview URLs redirect to Vercel login.
  Preview protection was preserved; those redirects are not page-level QA.

Production approved by the owner on 2026-09-21 ("ok deploy kon"). The exact
CI-verified correction commit was fast-forwarded to `main`, with no force push
and no additional implementation changes. Previous production was
`34aeb995e33e13ae3479e48d7e2451708fc06c19` and remains the rollback reference.

Production Vercel build `Aj4itFkMufSrddZCRjkMDgCv9Tr6` succeeded on 2026-09-21.
GitHub deployment `6558280679` reports `Production – res-publica`, success:
`https://res-publica-q6aba51so-res-publica1.vercel.app`.

Post-deployment checks on `https://respublica-ev.de`:

- All 33 DE/EN/FA routes passed (HTTP 200, correct language/direction, shared
  architecture and main content).
- All three home pages contain the new wordmark class and no retired header or
  forum image source. Browser inspection confirmed zero such image elements.
- Site liveness, HDR environment and Lion-and-Sun texture returned HTTP 200.
- Persian desktop (1280x720) and mobile (390x844) views reached WebGL ready;
  no horizontal overflow or browser error logs were observed. At mobile scroll
  position 740 the camera stayed `2.40,6.15,13.60`, frame count 2 (no idle loop).
- Temporary viewport override was reset. No production form or account action
  was submitted. Actual iOS/Safari and field-performance limitations above remain.

The live custom domain now serves correction commit
`4115e5d0983e0d2fdd632337d7e742c0dd090eeb`. Local preview remains at
`http://127.0.0.1:3100/fa`.

## 2026-09-21 — Restore the requested moving, continuous mobile architecture

The preceding release's static mobile camera and opaque mobile reading canvas
were verified technically but did **not** meet the owner's cinematic brief.
The following correction supersedes those design decisions, not the preserved
route/content/form behavior.

- A bounded 36-second camera dolly now runs in all seven public architectural
  rooms, including phones. Home scrolling adds a visible elevated atrium arc;
  one viewport of scrolling is no longer diluted across the whole long page.
- DE/EN/FA each have a visible pause/resume button. Reduced motion wins over
  autoplay; forms, open dialogs and hidden tabs suspend the rendering loop.
- Mobile retains the fixed full-viewport scene across the entire page. Opaque
  section backgrounds and the 57svh canvas limit were removed. Individual
  reading panels remain legible, and mobile team portraits are compact rows.
- Portrait framing aims further into the room instead of mainly at its ceiling.
  Wide room shots and bounded motion avoid approaching the artificial people.
  No human models were replaced; this is not a photorealism claim.

Local acceptance evidence:

- 93 focused tests in 13 files passed, including automatic movement in every
  room on both device modes, safe atrium bounds, pause/resume, reduced motion,
  frame-delta limits, mobile-shell and translated-control regressions.
- 33 route checks passed across DE/EN/FA; TypeScript and scoped ESLint passed.
- Browser at 390x844: canvas height 844, no horizontal overflow; camera changed
  without scroll from `2.77,6.15,13.12` to `1.29,6.15,13.32`.
- Pause held camera `1.28,6.15,13.34` and frame 589 across separate observations.
  Resume advanced the frame count and followed the restored scroll position.
- All six home section/close shells computed transparent; the 3D canvas stayed
  fixed at 844px after scrolling to 4978px. No retired background was restored.
- English desktop 1440x900 and German research tablet 768x1024 were inspected.
  Research camera moved from `-11.39,3.40,16.41` to `-12.41,3.40,16.25` without
  another scroll. German phone 375x812 retained a full-height moving scene and
  no horizontal overflow after the portrait-framing correction.
- The local reduced-motion preference was tested and restored. No production
  preferences, forms or account data were changed. A nonfatal GPU shader
  precision warning was observed; no application error was observed.

Limits: no physical iPhone/Safari run, field CWV, measured GPU frame-rate claim,
or approved pixel baseline. Shader warm-up still requires load time; build and
browser contention during local QA is not a mobile performance benchmark.
Production remains at `4115e5d` until the owner approves this corrected preview.
