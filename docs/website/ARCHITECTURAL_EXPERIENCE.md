# Approved architectural experience

## Release update — 2026-09-20, after owner approval

The owner has now approved the latest implemented preview and asked for its
deployment in all three languages. The current source enables the architectural
shell by default, without localhost/session/query gating. Old hero scene
components are no longer mounted on the home page. Indoor flag drapes are static.
This supersedes the opt-in delivery boundary described historically below.
Approval of this release does not establish equivalence to the photoreal reference.
Deployment evidence and remaining checks are tracked in `DEPLOY_CHECKLIST.md`.

## Status — 2026-09-19

The owner approved the visual direction in
`approved-architecture-reference-2026-09-19.png` after explicitly rejecting
the procedural, miniature-like hero currently implemented. This is approval
of an art-direction reference, not acceptance of an implemented experience.
The image was generated using the built-in image-generation tool; it is a
synthetic architectural visualization, not a photograph of an existing facility.

This document specifies the requested replacement. It does not introduce a
new project phase or authorize publishing an unfinished replacement.

## Visual brief

- A single continuous, inhabited building throughout the public website.
- Realistic architectural scale, natural daylight, oak, limestone, low-iron
  glass and restrained bronze detailing, as in the approved reference.
- A forum whose nested upright U-shaped plan preserves the navy/red identity.
- An amber chandelier physically suspended above the forum, with integrated
  illumination; never a pasted floating image.
- Library, research studio and shared circulation visibly belong to the same
  building, not independent image cards or disconnected decorative scenes.
- Believable human anatomy, natural activity and credible furniture contact.
  Anonymous scene occupants must not be presented as actual staff or members.
- Real geometric depth and coordinated camera movement. Moving a raster
  background or applying CSS perspective alone does not satisfy the request.

## Interaction and preservation requirements

- Keep a persistent visual scene across public route transitions; do not
  repeatedly destroy/recreate the renderer for each page.
- Use bounded camera paths in the same coordinate system, with actual
  foreground/background occlusion and meaningful spatial continuity.
- Render text, navigation, forms and controls as accessible HTML, not into
  a canvas. Maintain contrast independently of scene lighting and camera pose.
- Do not intercept normal scrolling, keyboard navigation or browser history.
- Suspend camera motion while interacting with a form. Keep protected account
  and operational screens quiet and fully usable.
- Respect reduced motion and retain functional static fallbacks for unsupported
  devices, failed asset loading and WebGL context loss.
- Preserve routes, existing content, DE/EN/FA and Persian RTL, authentication,
  permissions, APIs, forms, consent, database and research activation gates.

## Asset inventory and remaining quality gap — 2026-09-20

The original inventory contained only a procedural forum and raster assets.
The local preview now includes a continuous authored procedural building,
six distinct licensed Microsoft Rocketbox FBX people, Poly Haven material maps and
daylight HDR. Sources, pinned versions, licenses and checksums are recorded in
`public/architecture/ATTRIBUTION.md` and `manifest.json`. These older realtime
avatars are not cinematic-quality scans. Asset availability must not be
confused with meeting the approved visual reference.
Blender was not found on PATH or in the standard Windows Blender Foundation
installation directory. No dedicated 3D asset-generation connector was found
in the current tool inventory. These observations do not prove that suitable
assets are unavailable elsewhere.

To reproduce the approved quality as genuine 3D, the work needs an authored
building model, detailed furniture and human assets, appropriate material
maps, and lighting suitable for a browser renderer. Assets must have documented
rights for website redistribution. The reference PNG cannot supply hidden
geometry, physically correct materials, rigged people or additional viewpoints.

Do not substitute another primitive scene and call it photorealistic. Do not
purchase assets, activate a paid provider or upload personal photographs to
another service without the necessary authorization.

## Acceptance evidence before release

1. Compare browser screenshots to this approved reference; functional tests
   alone are not evidence of visual equivalence.
2. Demonstrate actual geometry and a continuous camera journey through the
   forum, library and research area without disconnected background swaps.
3. Verify readable DE/EN/FA content, Persian RTL, keyboard use, responsive
   layouts, reduced motion and static failure fallbacks.
4. Verify existing route/form/authentication behavior remains unchanged.
5. Measure frame time, download size and resource cleanup on representative
   desktop and mobile devices; set budgets before committing to final assets.
6. Show the implementation for visual acceptance before Production changes.

## Current delivery boundary

The worktree contains an opt-in local runtime at
`http://localhost:3100/fa?architecture=cinema` (also DE/EN). It uses one persistent
scene, accessible HTML reading surfaces and connected room camera routes.
Protected/form/legal routes retain their non-moving presentation. No production
deployment, configuration, authentication or database change has been made.

The September 20 correction removes the full-page reading veil and section-wide
backdrop blur, reduces reading-surface opacity, adds a daylight skylight, and
routes upper/ground camera travel through the open atrium rather than the slab.
Scroll selection is debounced; selecting the same room no longer restarts travel.
The ecosystem is now a semantic three-domain atlas with a separate shared-service
rail, rather than orbiting particles around a central authority node.

The current owner-facing definition, stage status and visual acceptance gates
are recorded in `CINEMATIC_ACCEPTANCE.fa.md`. This is the continuation of the
existing scene, not a new implementation or a replacement brief.

The latest completed focused run passed 68 checks across ten files (site scene,
camera, UI, public boundaries and dictionaries); this is not the entire repository
suite. Typecheck, lint and `git diff --check` passed. An isolated production build
completed with exit code 0 and generated 173 pages. Its retained result is
`C:/Users/alblo/AppData/Local/Temp/res-publica-build-tFAzJF/build-result.json`.
No `.env` files or credentials were copied; this was not a production deployment.

Browser checks covered Persian desktop/mobile (390×844), English and German
desktop, distinct publication/HARM/programme rooms, no horizontal overflow,
dark mode, increased text size and high contrast. Reduced motion stopped the
actual camera frame counter and panel transforms. These checks are preliminary
QA, not owner visual approval or proof that every route/form works end-to-end.

Rendering corrections include AO exclusion for glazing/cut-out hair, metre-scale
limestone UVs even without an albedo texture, continuous oak veneer rather than
parquet, improved shelf visibility, chair armrests, microphone details and rounded
camera-path corners. A subtle 768px floor reflection is desktop-only. It adds a
render pass: the earlier 441-draw-call measurement must not be presented as the
current reflection-enabled scene. One settled programme frame reported 43.2ms
CPU submission time; that is neither GPU time nor evidence of a sustained 30fps.
Performance acceptance remains open. Local architecture assets total 14,103,306
bytes in the checksum manifest (before transfer compression).

Only EU, Germany and the supplied Lion-and-Sun flag are currently rendered. The
requested UN/UNESCO flags and recognisable board likenesses remain unimplemented;
existing avatars must not be represented as the actual board members.
The full cinematic quality target remains **unmet**: occupants, lighting,
environment detail and motion still need visual acceptance. This is a technical
preview, not an approved photorealistic release.

## Subsequent realism pass — 2026-09-20

Replaced the indoor Lebombo HDR and primitive exterior box-city with an outdoor
urban courtyard lighting/background environment. Added a CC0 marble finish,
bronze column edge detailing, open shelf carcasses, modelled lounge chairs and
three detailed plants. The forum camera is now closer to human eye height above
the gallery level. Skin/fabric shading and arm resting poses were adjusted, but
the six underlying human meshes are still Rocketbox; they are not scanned people.
The added plant LOD cuts its triangle count by about 78%; browser performance
acceptance is still pending. This source revision has not had a new production
build or deployment; the earlier 173-page build predates this pass.

The owner supplied two additional PNG references (16_39_29 exterior and 16_38_54
inhabited research interior). They establish the required realism, not a supply
of reusable rigged geometry. Do not claim their people have been imported into
the live scene. High-quality reconstruction/appropriate redistributable human
assets remain the central unresolved issue, not a missing CSS effect.
