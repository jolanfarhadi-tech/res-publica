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

- 94 focused tests in 13 files passed, including automatic movement in every
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
- Final phone review also corrected the publications close-up: the camera now
  looks along the display aisle, and portrait target offsets scale with viewing
  distance. Verified at 375x812 with multiple displays visible and no overflow.
- Local production build passed (173 pages) before this final two-file framing
  adjustment: `C:/Users/alblo/AppData/Local/Temp/res-publica-build-tItXxi`.
  Final commit acceptance requires its own green remote CI/build.

Limits: no physical iPhone/Safari run, field CWV, measured GPU frame-rate claim,
or approved pixel baseline. Shader warm-up still requires load time; build and
browser contention during local QA is not a mobile performance benchmark.
Production remains at `4115e5d` until the owner approves this corrected preview.

Final remote result for `e129933a8c3c5711227e5cc1796e6845c6a1b7ce`:

- CI succeeded: https://github.com/jolanfarhadi-tech/res-publica/actions/runs/35542548112
  (job `106162715424`, including full tests, lint, type checks and production build).
- Primary Vercel preview succeeded, deployment `8p83RZ7HmXFGuBYTtzHEDZAsUHMm`:
  https://res-publica-htdkp2dfq-res-publica1.vercel.app
- Anonymous DE/EN/FA preview requests each redirect to Vercel SSO (302).
  Protection was not bypassed or disabled; hosted page-level visual QA therefore
  remains gated. The three-language local route and visual evidence above is
  not represented as anonymous hosted-preview acceptance.
- Working local preview: http://127.0.0.1:3100/fa . Browser viewport override was
  reset and the preview tab retained for the owner. No production push occurred.

## 2026-09-21 — Restore the owner's first evening deployment, not the later dolly

The owner clarified that the target is the first replacement deployed roughly
two hours earlier. GitHub and Vercel agree on production `34aeb99`, created
2026-09-20 21:25:32 UTC (23:25 Berlin), deployment `C1perqdDo8kTf6iJZyiN9MGSBvZN`,
https://res-publica-q4zv60ma2-res-publica1.vercel.app . This precedes the supplied
phone screenshot (23:33). The later `4115e5d` production and `e129933` preview
are not the approved motion baseline.

- Restored physical, scroll-directed room-to-room travel rather than the later
  repeating dolly or fading between static viewpoints. Building geometry,
  furniture and people assets are unchanged from `34aeb99`.
- Seven homepage chapters use seven distinct rooms. Travel uses rounded paths,
  open circulation lanes, bounded active-frame time and pause/reduced-motion
  controls; targets cannot point above the travelling camera.
- Research/library viewpoints stay back from standing people at near eye level.
  The corrected publication aisle view and full-viewport mobile scene remain.
- Removed two unused legacy skin implementations and their tests, plus ten
  retired generated background images. Removed their remaining CSS references.
  Logos, portraits, content and the current 3D building remain. The deleted
  tracked files are recoverable from Git; no content/post records were deleted.
- Local TypeScript and scoped ESLint passed. 87 focused tests in 12 files passed,
  including every pair of room transitions, three-language mobile invariants,
  retired-asset absence, reduced motion, pause and rapid redirect continuity.
- All 33 public route checks passed in DE/EN/FA (HTTP 200, language/direction and
  shared architectural shell). Phone 390x844 had no horizontal overflow. Browser
  inspection observed forum -> studio -> review with changing physical camera
  coordinates, and the canvas explicitly identifies baseline `34aeb99`.
- A full local parallel test run exhausted host memory; it is NOT a test pass.
  The one-worker retry was interrupted after stalling. Desktop visual QA also
  hit browser/GPU recovery trouble after that memory event. Final full-suite and
  production-build acceptance must come from the exact commit's remote CI.

Production is still `4115e5d`. No Vercel deployments have been deleted. The
obsolete online deployments were identified separately from local asset cleanup;
the requested `34aeb99` baseline and the active production must be preserved
until a verified replacement is approved. Hosted preview validation and the
WEB-09 owner approval gate remain required before production promotion.

Exact restored-preview result, commit `c8cb4749780f9ac5623e6636b32c146b9f0e263b`:

- CI https://github.com/jolanfarhadi-tech/res-publica/actions/runs/35545059619
  succeeded (job `106169375915`): 566 tests in 130 files, lint, type checks,
  migrations and production build with all 173 generated pages.
- Primary Vercel deployment `HnrR14Kbb38M6FQoKEFXroyUBqHB` succeeded:
  https://res-publica-61cr6iqjx-res-publica1.vercel.app .
- The existing branch alias redirects anonymous DE/EN/FA requests to Vercel SSO
  (302). Protection was kept intact. Authenticated hosted visual QA could not be
  completed because the in-app browser failed to recover after host memory
  exhaustion; do not represent the local phone inspection as hosted/iOS QA.
- No production promotion or online deployment deletion was performed.

## 2026-09-21 — Owner-approved restoration published

Owner approved publication and cleanup ("enteshar bede lotfan wa ghadimiha ro
hazf kon"). Verified the preview SHA and successful CI again, then fast-forwarded
`main` from `4115e5d` to the exact tested `c8cb4749780f9ac5623e6636b32c146b9f0e263b`.
No implementation change or force push was included.

- GitHub production deployment `6559197021` for the primary `res-publica`
  project reports success: https://res-publica-np3svxfjp-res-publica1.vercel.app .
- https://respublica-ev.de/fa returns HTTP 200 and the restored baseline marker
  `34aeb99`. All 33 public DE/EN/FA route smoke checks pass.
- The retired forum-v6, architectural-field and membership-header image URLs
  return HTTP 404 on the live custom domain, not just locally.
- Live phone viewport 390x844: WebGL ready, full-height canvas, no horizontal
  overflow and zero retired-image elements. Scrolling changed the camera from
  forum `2.40,6.15,13.60` (frame 80) to studio `-12.00,2.15,12.80` (frame 291).
  This verifies room travel on deployed code, not physical iPhone/Safari support.
- Old Vercel deployment deletion has NOT occurred: the browser safety reviewer
  blocked entering Delete without fresh action-time confirmation. A separate
  confirmation asks to delete older `res-publica` deployments while retaining
  the production/preview pair for `c8cb474`. Code history and site data are not
  deletion targets. Pending confirmation must not be reported as completed.

## 2026-09-21 — Cleanup and camera/mobile follow-up (not a new production release)

- Owner gave fresh, risk-informed deletion approval ("hazf kon bere"), including
  losing instant rollback and breaking old integration/PR deployment URLs.
- Removed 42 older deployments from the primary `res-publica` Vercel project.
  The `c8cb474` production `7Zsrzx49vWsenJjJzARA96pdGhEW` and preview
  `HnrR14Kbb38M6FQoKEFXroyUBqHB` were explicitly protected throughout.
- One older target remains: `4BneDNuwMLUhuBvZEdn2BjJVsr1E`, July 24, commit
  `88354d8`, the latest preview on `integration/publishing-reconciliation`.
  The safety reviewer blocked this specific deletion because its branch alias
  remains active. A targeted owner confirmation is pending; do not report all
  hosted deployments removed. No Git history, content, database, domains or
  separate `res-publica-tq5l` project were deleted.

The owner then reported a blank background, delayed locale navigation, and
requested scroll-synchronised travel plus gentle autonomous camera movement.
The following changes are local and NOT deployed:

- Replaced debounced chapter switches with continuous document-anchor scroll
  progress along the existing authored indoor paths. Added bounded smoothing,
  reverse-scroll support and a sub-25cm ambient dolly without orbiting or zoom.
- Preserved paused/reduced-motion canvas pixels across browser compositing.
  Reduced motion still disables camera animation; it is never overridden.
- Parallelised essential texture loading and reveal the approved building before
  optional detail/people loading. Optional failures no longer hide the building.
- Added translated loading/retry states and WebGL-context recovery with a fresh
  canvas; released disposed GPU contexts.
- Locale links use native document navigation at the root lang/dir boundary,
  retaining the equivalent page path and explicit `hrefLang`.

Verification:

- 63 site tests in 11 files passed, including scroll continuity, reverse travel,
  pause/reduced motion, bounded ambient movement and locale/rendering guards.
- TypeScript and scoped ESLint passed; `git diff --check` passed.
- In-app browser desktop: visible forum, changing camera coordinates with scroll,
  then visible adjacent room. Idle camera reports `ambient`, pause works.
- 390x844 viewport: FA -> EN -> DE -> FA navigation via the actual mobile menu
  succeeded, with correct h1, lang/dir and no horizontal overflow. English and
  German scene screenshots were inspected. German reduced-motion reload retained
  the visible scene (frame 6, camera `2.40,6.15,13.60`, status `ready`).
- Test accessibility preferences were restored to `system`/reduceMotion false.
- The broader local 33-route smoke script was NOT completed: `/de` passed but
  `/de/about` exceeded its 60-second deadline during development compilation.
  The dev log subsequently returned HTTP 200 at 60588ms. This is not a pass,
  production performance validation, or a reason to waive release checks.
- Physical iPhone/Safari, release-build performance and a fresh hosted preview/CI
  run remain unverified. The production domain still serves `c8cb474`; do not
  describe these follow-up working-tree edits as deployed.

## 2026-09-21 — Background availability and integrated motion preferences

Owner requested retaining the current camera movement, fixing missing/delayed
backgrounds and removing the floating pause button; subsequently authorised
going live after the fixes are verified.

- Root cause of the membership screenshot: the public `/membership` route was
  excluded from the architectural room allowlist. It now uses the existing
  gallery view in DE/EN/FA. Private/protocol routes remain excluded; focusing
  form fields still suspends decorative rendering.
- The first real building frame no longer waits on any asset download. Valid
  initial material maps are replaced progressively with the existing original
  textures. HDR lighting, flags and people cannot hide the building if delayed
  or unavailable. No retired poster, geometry or camera route was introduced.
- Removed the floating camera button. Reduced motion remains in the existing
  site preferences and continues to respect the operating-system setting.
  Loading/retry feedback is in the document, not a bottom-corner camera widget.
- Disabled the development-only Next indicator for clean local previews.
- 66 site tests across 12 files pass; TypeScript, scoped ESLint and diff checks
  pass. Desktop 1440x900 membership: visible gallery, all texture/environment
  upgrades ready, ambient camera, zero floating controls, no horizontal overflow.
- Local server interruption was observed during laptop navigation; this is not
  a successful navigation test or proof of production performance. Remaining
  laptop/locale checks and the exact commit's CI/hosted release must finish
  before reporting this follow-up published. Physical Safari remains untested.

Final local follow-up, code commit `c3950bfb1fe58a09308ed57b80ef8b39333f95ee`:

- The restarted preview server completed all 33 public DE/EN/FA HTTP checks.
- Laptop 1366x768: Persian and German programmes screenshots inspected;
  actual FA -> EN -> DE language links loaded the equivalent page with correct
  language/direction, ready WebGL, original textures and no horizontal overflow.
  Both header logo variants loaded after the server restart.
- Preferences dialog: enabling reduced motion changed the renderer to
  `reduced` while the scene stayed visible. Restored the original unchecked
  preference without saving or changing consent settings.
- Phone viewport 390x844: German membership rendered the gallery, full-height
  canvas, readable header and no horizontal overflow. This is viewport testing,
  not a physical Safari result. The temporary viewport override was reset.
- Console inspection showed only the previously observed shader precision
  warnings, not application errors. No field performance/CWV claim is made.
- Git push was rejected by the safety reviewer pending explicit approval to
  transmit source/history to `jolanfarhadi-tech/res-publica`. The owner has been
  asked for that exact upload and publication approval. No alternative upload,
  hosted preview, new remote CI run or production deployment was attempted.
  Production remained at `c8cb474` at that point; see the approved continuation
  below for the subsequent release status.

## 2026-09-21 — Approved deployment continuation (`c3950bf`)

- The owner explicitly confirmed continuation of the requested source upload
  and publication. The exact code commit was pushed to the existing GitHub
  branch `codex/platform-phase-3`.
- GitHub CI run `35582991438`, job `106279849145`: PASS. All 575 tests in
  131 files passed; lint, TypeScript, secret/history scan, supply-chain and
  production dependency checks, fresh-database migrations and the 173-page
  production build passed.
- Creating a review PR through the installed GitHub integration returned HTTP
  403 (resource inaccessible to the integration). No PR was created and no
  permissions were broadened. The same complete workflow ran successfully on
  the release branch push; this is not described as a PR-based CI run.
- Hosted preview `Hwmvz9RmNLrtan5HDrpUcaBAhFYb` is ready at
  https://res-publica-jmu68qzab-res-publica1.vercel.app.
- Hosted browser checks: FA membership at 1440x900; actual FA -> EN -> DE
  membership language clicks; German membership at 390x844; Persian programmes
  at 1366x768. The gallery/learning scenes and original textures were ready,
  language/direction matched, there was no horizontal overflow and no floating
  camera control. No browser error-level messages were captured.
- Preview membership reports the protected application service unavailable;
  the decorative-background fix does not change or bypass that service.
- After checking that production `c8cb474` is an ancestor, the tested commit was
  fast-forwarded to `main` without force. Production deployment
  `HpY3LiEaGgE7cfHbi9nDeHkCKfhG` reached Ready at 11:33:16 CEST. Vercel confirms
  source `main` / `c3950bf`, Production environment and `respublica-ev.de` domain.
- Post-release `scripts/check-architectural-release.mjs https://respublica-ev.de`:
  all 33 public routes passed (HTTP 200, expected language/direction,
  architectural mode, main/heading and no retired hero markup).
- Production browser checks: Persian membership at 1366x768, actual FA -> EN ->
  DE membership language changes at 1440x900, and a fresh German membership
  load at 390x844 all showed the ready gallery and no floating camera control
  or horizontal overflow. The production membership service presents its
  normal sign-in/account options; no authentication or application was submitted.
- Live Persian home: scrolling from 0 to 1800 changed the camera from
  `2.42,6.15,13.60` to `-11.95,2.15,12.73`; renderer reported `travelling`
  and the inspected screenshot retained an indoor architectural view.
  At rest the renderer reported `ambient`. No error-level browser logs appeared.
- Main-branch workflow runs `35583780708` and `35583780672` also completed with
  success. The deployed code remains exactly `c3950bf`; this appended verification
  record is local documentation and does not alter the released assets.
- Physical iPhone/Safari and field Core Web Vitals are not verified. Viewport
  checks are not represented as physical-device testing.

## 2026-09-21 — Site-wide scroll and frame-pacing correction (publication pending)

Owner reported the same camera/loading issue throughout the site, not just
`/de/programs`, and explicitly requested another production release after fixes.

- Reproduced: an internal page scrolled to 1381px but retained essentially the
  same learning-room camera; only the 16cm ambient drift was active. The shell
  registered scroll updates only when a `.home-stage` existed.
- Every allowlisted architectural room now has its own bounded in-room dolly
  controlled by document scroll, in all locales. Camera height/FOV and existing
  home room-to-room routes remain unchanged. Private/legal routes remain quiet.
- Critically damped scroll velocity replaces clipped first-order steps, with
  equivalent 30/60/120Hz tests and stable direction reversals. Bounded ambient
  drift is slightly more visible. OS/site reduced-motion preferences still win.
- Removed the hard 30fps cadence. Frame deadlines now target 60Hz, and sustained
  measured frame pressure reduces optional GPU passes/pixel count without
  oscillation. Mobile uses direct antialiased PBR rendering, not the multipass
  desktop pipeline. Desktop AO, when affordable, runs at half resolution.
- Realtime planar floor reflection no longer redraws the whole scene during
  motion; existing material/environment reflections, geometry and original
  textures are preserved. FBX/GLTF/postprocessing code loads after the first
  building frame. Avatar posing/baking yields between occupants; independent
  avatar textures load concurrently. Readiness fade reduced from 450ms to 150ms.
- Local: 81 tests/13 files, TypeScript and scoped ESLint passed. At 1440x900 on
  `/de/programs`, scrolling changed camera z from 3.08 to 0.04. Steady measured
  cadence was 16.6–16.7ms, CPU submission 4.6–5.1ms, about 487k triangles instead
  of the former 1.43m. These are this browser's observations, not a device-wide
  60fps guarantee or physical iPhone result. Development first-frame time is
  not used as a production-loading measurement.
- Hosted exact-commit CI/preview and post-release checks still pending.
