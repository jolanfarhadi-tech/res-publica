# Module: HARM Governance

## Incremental Mandatory-hardening Phase-B boundary — 2026-08-16

Governance role grants and revocations now require five-minute recent MFA,
exact institution scope and an operation-compatible reason. Revocation selects,
locks, conditionally updates and audits the target grant in one transaction, so
repeated/concurrent revocation cannot create duplicate canonical evidence.
Governance remains isolated from Civic/Publishing authority and HARM operations
remain server-disabled unless their separate activation gate is approved.

## Incremental implementation — server activation gate, 2026-07-29

Every existing Governance write route shares the
`governance.privileged-write` boundary. That boundary now returns a correlated,
private `503 feature_not_activated` unless the server-only
`HARM_OPERATIONS_ENABLED` value is exactly `true`.

The gate runs after trusted-origin rejection and before database runtime,
distributed rate limiting, actor resolution, authorization, persistence, or
audit mutation. It does not weaken or replace institution-scoped capabilities,
MFA, separation of duties, provenance, atomic state-plus-audit transactions,
or any domain invariant when activated.

Activation remains an owner-controlled Production action and requires the
secure storage, safeguarding, privacy/legal, accountable-administrator, and
incident-response gates recorded in `SECURITY_LEGAL_GATE_REGISTER.md`.

## Incremental implementation — privileged write protection, 2026-07-29

All 12 write methods under `src/app/api/governance/` use the shared
`executePrivilegedWrite` boundary and
`GOVERNANCE_PRIVILEGED_WRITE_RATE_LIMIT` before parsing, actor resolution, or
application persistence. The stable policy is 60 attempts per fifteen minutes
per pseudonymized client and the response is correlated by `X-Request-ID`.

The HARM Governance application/domain services were not changed. Their
institution-targeted capabilities, MFA assurance, role separation, review
invariants, atomic records, and canonical AuditLog remain authoritative.
The executable route-inventory test fails if any of the 12 methods loses the
shared protection.

## Purpose

Implements the operational workflow (intake, review, repair, authority delegation) supporting Res Publica's HARM operating methodology. Evidence: `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` (read in full, prior session — defines the 12-stage HARM Lifecycle this module operationalizes); `src/modules/harm-governance/` (implementation).

## Canonical authority

- `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` — the 12-stage HARM Lifecycle, the H-A-R-M analytical engine, roles (Participant, Witness, Moderator, Researcher, Reviewer, Facilitator, Community Leader, Expert, Observer, Institution).
- `architecture/adr/ADR-020-dual-intake-and-review-paths.md`, `ADR-021-national-harm-taxonomy-classification-layer.md` — intake/review path and classification architecture.
- `docs/source/methodology/{HARM_CODEX,HARM_LIFECYCLE,EVIDENCE_MODEL,SCIENTIFIC_REVIEW,STRUCTURED_HEARINGS,REPAIR_FRAMEWORK,BASIC_VALIDATION_FRAMEWORK,DOCUMENTATION_QUALITY_REVIEW,HEARING_QUALITY_CHECK}.md` — supporting methodology documents (not individually read in full this session; titles/paths confirmed via directory listing).

## Current implementation

`src/modules/harm-governance/{authority.ts, authority.test.ts, harm-governance.test.ts, identity-evidence.ts, manifest.ts, types.ts, workflow.ts}` (directory listing confirmed this session; `authority.ts` pattern sampled — same capability-tuple call convention as `src/modules/publishing/authority.ts`, both read this session for comparison). Application layer: `src/application/harm-governance.ts`, `src/application/harm-governance-review.ts`, `src/application/harm-governance.integration.test.ts`.
Committed via `ea21f79` (workflow core), `5750337` (review and repair workflow), `11146fa` (protect governance authority delegation), `d8054cd` (scoped HARM intake and validation APIs), `91684c1` (complete HARM governance methodology workflows) — all 2026-07-19, all ≤ `origin/main` tip `7025e6f`.

## Data and persistence

`src/persistence/module-schema.ts` (grepped this session): `harmCases` (L243), `harmEvidenceItems` (L269), `basicValidationDecisions` (L283), `structuredHearings` (L300), `evidenceQualityAssessments` (L313), `documentationQualityReviews` (L324), `hearingQualityReviews` (L334), `scientificReviews` (L343), `repairPlans` (L357). Migration coverage: `drizzle/0008_harm-governance-core.sql`, `drizzle/0009_harm-governance-review-repair.sql`, `drizzle/0010_harm-case-institution-scope.sql` (filenames confirmed; contents not read this session).

## Authorization and trust boundaries

`src/modules/harm-governance/authority.ts` uses the same capability-tuple pattern as `src/modules/publishing/authority.ts` (both call the shared `src/auth/authorize.ts` primitive — see `MODULES/identity-auth.md`). Specific capability names/roles for this module were not individually enumerated this session (file exists, was not read line-by-line — unlike `publishing/authority.ts`, which was read in full).

## Public interfaces

`src/app/api/governance/{cases,documentation-quality,evidence,evidence-quality,grants,hearing-quality,hearings,repair-plans,scientific-reviews,validation}/` — ten route directories confirmed via directory listing this session; individual route files and their exact HTTP methods were **not** individually enumerated or read this session. **This is the least independently re-verified module in this compilation** — treat implementation-depth claims here as directory-listing-level confidence only, not code-read confidence.

## Verification

Tests confirmed to exist: `src/modules/harm-governance/{authority.test.ts, harm-governance.test.ts}`, `src/application/harm-governance.integration.test.ts`. **Not run this session.**

## Decisions and rejected approaches

- "Validation Framework" terminology retired in favor of "Reflection not Validation" — commits `83cde16`, `dda929c`; `hearing_validated` renamed to `hearing_documented` — commit `d20c562`. See `ARCHITECTURE_MEMORY.md` §"Decisions that superseded earlier decisions."
- HARM Lifecycle step count: 12-stage internal cycle is canonical; website's "8 steps" is a simplified public presentation, not a competing version (`docs/source/DECISION_LOG.md` item 1).

## Current status

**REMOTE_VERIFIED**, **IMPLEMENTED_NOT_REVERIFIED** for the module/application layers (source + tests exist, on `origin/main`, not re-run). **UNKNOWN** for the ten `src/app/api/governance/*` route implementations specifically — existence confirmed, contents/completeness not assessed this session.

## Open work

No specific unfinished item was confirmed with direct evidence for this module beyond the general "tests not run, API routes not individually verified" caveats above. If a task touches this module, read the actual `src/app/api/governance/*/route.ts` files and `src/modules/harm-governance/workflow.ts` before assuming any specific capability is or isn't implemented — this compilation's confidence here is lower than for `publishing` or `member-profile`.

## Do not redo

Do not re-implement the HARM Lifecycle's 12-stage cycle definition or the H-A-R-M analytical engine — both are canonically defined in `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` and should be referenced, not restated or redesigned.

## Evidence index

- `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` (full read, this session)
- `architecture/adr/ADR-020-dual-intake-and-review-paths.md`, `ADR-021-national-harm-taxonomy-classification-layer.md`
- `src/modules/harm-governance/*` (directory listing, this session)
- `src/application/harm-governance{.ts,-review.ts,.integration.test.ts}`
- `src/persistence/module-schema.ts:243,269,283,300,313,324,334,343,357`
- `drizzle/0008_harm-governance-core.sql`, `0009_harm-governance-review-repair.sql`, `0010_harm-case-institution-scope.sql`
- commits `ea21f79`, `5750337`, `11146fa`, `d8054cd`, `91684c1`
