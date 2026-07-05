# Res Publica — Phase 0 Review

*Architecture Guardian review of the complete Phase 0 change set — all four P0 fixes adopted by `architecture/adr/ADR-012-phase-0-build-order-correction.md`, reviewed as a single unit before commit. Reviewed against Constitution v1.0, Foundation Architecture, ADR-011, ADR-012, and Implementation Plan. No source code was changed by this review; it records the verification already performed against commit `eda2fdc`.*

---

## Scope reviewed

Commit `eda2fdc` ("Phase 0: apply four P0 fixes per ADR-012"), 12 files:

1. **Delete broken/dead `proxy.ts`** — `proxy.ts` (deleted), `middleware.ts` (ported q-value-aware Accept-Language parsing), `scripts/check-structure.mjs` (guard against reappearance)
2. **Slug validation / path-traversal hardening** — `src/lib/collections.ts`, `src/lib/content.ts` (slug pattern guard), 5× `[slug]/page.tsx` (`events`, `news`, `projects`, `publications`, `research` — `dynamicParams = false`)
3. **Newsletter rate limiting** — `src/app/api/newsletter/route.ts` (in-memory, 5 req/hour/IP)
4. **JSON-LD escaping** — `src/components/seo/JsonLd.tsx` (`<` → `<`)

## Verification results

| # | Check | Result |
|---|---|---|
| 1 | Phase 0 scope has not expanded | PASS — exactly the 4 items ADR-012 adopted; no Core Domain Model, Plugin Architecture, CLI, or MVP module work touched; no `brain/` or `architecture/adr/` file modified |
| 2 | Every modification belongs to an approved ADR | PASS — all 12 changed files trace to ADR-012 |
| 3 | No hidden architectural debt | PASS, with disclosed findings — see Concerns 1–2 |
| 4 | No existing architecture contract broken | PASS — no exported function signature, route HTTP contract, or component prop shape changed |
| 5 | Phase 1/2 compatibility | PASS — `dynamicParams=false` comments explicitly flag re-evaluation triggers (CMS/ISR/user-generated/AI-dynamic routes) mapping onto future Publishing/AI Layer work; rate-limiter comment flags its own future replacement |
| 6 | Build/Typecheck/Lint clean | PASS — reconfirmed on the full combined change set: build succeeds, typecheck zero errors, lint shows only the same single pre-existing, unrelated warning (`dict` unused in `src/app/[locale]/page.tsx`) present before any Phase 0 work began |
| 7 | Security posture improved | PASS — dead/broken routing file removed, path-traversal input validated, rate limiting added where none existed, XSS injection vector in JSON-LD closed |
| 8 | No performance regression | PASS — every addition is O(1); build output bundle sizes unchanged across every fix's build run |
| 9 | Public APIs unchanged | PASS — new 429 response is additive; no existing response shape, route signature, or exported function changed |
| 10 | Documentation matches implementation | PASS, with a disclosed gap — see Concern 3 |

## Concerns

1. **(Medium, newly surfaced by this review) The in-memory rate limiter's `requestCounts` Map never evicts stale entries.** Every IP that ever makes a request keeps a permanent entry for the life of the process — slow, unbounded memory growth under real traffic with many distinct IPs. Distinct from the already-disclosed per-process/no-horizontal-scaling limitation. Small practical impact at this project's traffic scale; worth a follow-up, not silently left undocumented.
2. **(Low) `SLUG_PATTERN` is duplicated verbatim in `src/lib/collections.ts` and `src/lib/content.ts`** rather than a shared constant. Deliberate at the time (no existing shared-utils file); a drift risk if the pattern is ever updated in one file and not the other.
3. **(Medium, expected/deliberate) `brain/ROADMAP.md` and `brain/BLUEPRINTS/implementation-plan.md` now describe these 4 P0 items as unresolved — that's stale.** Direct, correct consequence of "do not touch any Foundation or Brain documents" holding throughout implementation. Recommend a dedicated follow-up Brain-update pass (through the normal ADR/amendment channel) to mark Foundation Build Order Step 0 complete — intentionally not done as part of this review.
4. **(Procedural, resolved before commit) `.claude/settings.local.json` was modified in the working tree but unrelated to any of the 4 fixes or ADR-012** (accumulated tool-permission state). Excluded from the commit above; remains as an unstaged, unrelated local change.

## Risk level: Low

None of the four concerns block approval — three are disclosed/tracked follow-ups, one was a procedural exclusion already handled.

## Recommendation: PASS

## Record

- **Commit:** `eda2fdc` — "Phase 0: apply four P0 fixes per ADR-012"
- **Tag:** `phase-0-complete`
- **Approved by:** Human Approval Authority (per Constitution §16), this review session

---

Phase 0 implementation is complete. Phase 1 (Core Domain Model, per Foundation Build Order Step 1) has not been started. This review does not itself authorize Phase 1 — that requires a separate, explicit decision.
