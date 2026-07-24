# Module: Identity, Authentication & Authorization

## Purpose

Session/identity resolution and a shared, capability-based authorization primitive used across governance domains (publishing, HARM governance). Evidence: `architecture/adr/ADR-027-identity-authentication-authorization.md` (defines identity/session/auth boundaries); `src/auth/` directory (implementation).

## Canonical authority

- `architecture/adr/ADR-027-identity-authentication-authorization.md` — `## Status`: "Accepted — explicitly approved by the Founder on 2026-07-19" (read in full this session).
- `architecture/adr/ADR-030-ai-runtime-boundary.md` — shared runtime mechanism pattern, domain decisions stay domain-owned (this module's authorization model is reused by other domains, not owned by them).
- `docs/source/foundation/04_GOVERNANCE.md` — general governance boundary (not read in full this session; cited by other modules).

## Current implementation

`src/auth/{oidc.ts, actor-resolver.ts, runtime.ts, store.ts, authorize.ts, request-security.ts, crypto.ts, types.ts}`. `types.ts` defines `AuthenticatedActor`. `authorize.ts` implements the shared capability-based authorization primitive consumed by Publishing and HARM Governance. A scoped uncommitted change adds `AuthorizationRequest.requireExactTarget`; its default preserves existing module behavior, while Publishing opts in so a null-target grant cannot authorize a publication-scoped operation.
Committed via commits `a9fac9c` ("Add M2 module bootstrap and auth foundation"), `e31ca3c` ("Add OIDC membership and event flows"), `770857e` ("Add authenticated session controls") — all on `main`, all ≤ `origin/main`'s tip `7025e6f` (i.e., pushed to remote).

## Data and persistence

`src/persistence/schema.ts`: `authIdentities` (L99), `authSessions` (L115), `authFlows` (L132), `authorizationGrants` (L146) — all confirmed via `grep "pgTable" src/persistence/schema.ts`, this session. Migration coverage: `drizzle/0004_m3-auth-foundation.sql`, `drizzle/0005_m3-oidc-flows.sql` (filenames confirmed; contents not read this session).

## Authorization and trust boundaries

Capability-tuple model: `{domain, capability, target, minimumAssurance, requireExactTarget?}`. Publishing calls it with `domain: "civic"`, `capability: "publishing.role.<role>"`, the exact publication scope, `minimumAssurance: "mfa"`, and `requireExactTarget: true`. The opt-in flag prevents wildcard/null-target grants only for callers that require exact scoping; other domains retain the established matching behavior. Domain-specific capabilities remain owned by their modules.

## Public interfaces

`src/app/api/auth/{callback,login,logout,session}/` (route files confirmed to exist via directory listing this session; contents not individually read).

## Verification

Tests: `src/auth/authorize.test.ts`, `src/auth/config.test.ts`, `src/app/api/auth/routes.test.ts`. **Verified 2026-07-24:** authorization tests passed in the final 32-test focused set, and the full one-worker suite passed 156/156.

## Decisions and rejected approaches

No explicit "rejected alternative" text was found for this module specifically in the ADR (`ADR-027`'s Alternatives section, if any, was not read in full this session — only the Status header was directly checked). Do not assume alternatives were or weren't considered without reading the full ADR.

## Current status

**REMOTE_VERIFIED** for the committed identity/auth baseline. The exact-target authorization option is **UNCOMMITTED_WORKTREE, LOCALLY_VERIFIED 2026-07-24** and is part of the Publishing Authority commit boundary.

## Open work

None specifically identified for this module in this compilation beyond the general "tests not run" caveat above (`WARNINGS_AND_DEBT.md` does not list a specific open item for identity-auth itself, only for modules whose README text is now stale relative to this module's implementation — see `WARN-004` in `WARNINGS_AND_DEBT.md`).

## Do not redo

Do not re-implement the capability-tuple authorization primitive — it already exists at `src/auth/authorize.ts` and is the pattern two other modules (`publishing`, `harm-governance`) already reuse successfully. A new domain needing authorization should follow the same `{domain, capability, target, minimumAssurance}` pattern, not invent a new one.

## Evidence index

- `architecture/adr/ADR-027-identity-authentication-authorization.md`
- `src/auth/{oidc.ts, actor-resolver.ts, runtime.ts, store.ts, authorize.ts, request-security.ts, crypto.ts, types.ts}`
- `src/persistence/schema.ts:99,115,132,146`
- `drizzle/0004_m3-auth-foundation.sql`, `drizzle/0005_m3-oidc-flows.sql`
- commits `a9fac9c`, `e31ca3c`, `770857e`
- tests: `src/auth/authorize.test.ts`, `src/auth/config.test.ts`, `src/app/api/auth/routes.test.ts`
- command: `git log origin/main..main` → `5212636` only (confirms auth commits are on `origin/main`, being older than `main`'s unpushed tip)
