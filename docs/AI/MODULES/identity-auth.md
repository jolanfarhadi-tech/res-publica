# Module: Identity, Authentication & Authorization

## Incremental foundational-authority provisioning — 2026-09-02

`src/application/founder-authority.ts` and the non-HTTP
`ops:record-founder-authority` command persist an externally approved
Institution Admin or Publisher appointment using two distinct active OIDC
identity links, an exact target and a UUID approval reference. Self-appointment,
invalid/disabled identities, expired appointments and duplicate active grants
fail before mutation. Grant and canonical audit evidence are atomic; raw
issuer/subject values are not copied into audit evidence or command output.

This is not an identity-provider role bridge or universal admin. The web
Control Panel cannot create foundational authority. Existing operational
delegation remains session-derived, exact-scope, recent-MFA protected and
domain-owned under ADR-033/036. No migration was required.

## Incremental Mandatory-hardening Phase-C boundary — 2026-08-16

The shared authorization primitive now checks a server-only list of exact
`domain:capability` quarantine keys before assurance and grant evaluation. A
quarantined capability fails closed even when an otherwise valid actor, MFA
state, target and grant are present. Keys contain no person, session, IP or
target identifier. This is emergency containment, not grant revocation or a
replacement for provider credential isolation.

## Incremental Mandatory-hardening Phase-B boundary — 2026-08-16

The shared authorization primitive now validates `recent-mfa` against the
provider-authenticated instant with a five-minute maximum age; stale, future or
invalid instants fail closed. `/api/auth/login?stepUp=recent-mfa` requests fresh
provider authentication with standard OIDC `prompt=login` and `max_age=0`.
Signed provider claims remain authoritative for the resulting assurance.

Selected high-impact operations additionally require bounded,
operation-compatible reason codes and server request IDs. No universal admin,
caller-supplied actor or locally fabricated MFA state was introduced.

## Incremental Release-D capability boundary — 2026-08-16

Verified signup now creates an exact Civic `ai.rag.query` grant targeted to
`public-knowledge` in the same transaction as the Person, identity, other
bounded self-service grants and canonical audit evidence. The governed query
route resolves only the session actor and requires verified assurance plus an
exact target before retrieval. Existing accounts are not silently broadened;
they require a separately approved and audited provisioning operation.

## Production and observability update — 2026-08-10

The verified-signup implementation is committed in `326229f`, deployed in
Production commit `7d2bb07`, and backed by migrations through 0018. Live Auth0
discovery and login initiation now use the approved EU tenant, exact Production
callback, PKCE, state and nonce; the former callback mismatch is resolved.

Session responses are explicitly `private, no-store` with `Vary: Cookie`.
Handled OIDC-provider failures emit a structured event containing only a
server request ID, dependency and status. The scheduled monitor checks Auth0
discovery directly rather than creating recurring OIDC flows. A controlled E2E
script can validate a real synthetic session and genuine MFA but stores and
prints no session cookie. Authenticated Membership/board E2E remains unclaimed
until such an owner-controlled session is supplied.

## Incremental verified-signup boundary — 2026-08-04 (subsequently committed and deployed)

OIDC flows now persist `login` versus `signup` intent. Signup uses the provider's
hosted credential UI; the application still stores no password. An unknown OIDC
identity is self-provisioned only for signup intent with stable issuer/subject
and `email_verified=true`. Existing-email ambiguity fails closed for human
identity review instead of auto-linking. The minimal Person, AuthIdentity, two
self-service grants, and audit evidence commit atomically.

A regression test exposed and fixed the existing callback's immutable Fetch
redirect-header bug: successful callbacks now construct a mutable 303 response
with the secure session cookie rather than appending to `Response.redirect()`.

## Production verification — 2026-07-30

The configured Production login route returns an Auth0 Authorization Code
Flow redirect with PKCE, state, nonce, the expected client ID, and exact
`redirect_uri=https://respublica-ev.de/api/auth/callback`. Anonymous session
inspection reports authentication available, and callback requests without a
valid state fail closed.

Auth0 still returns `Callback URL mismatch` because the exact redirect URI is
not present in the application's Allowed Callback URLs. Auth0 management access
was not authenticated, so no external setting was changed. Dashboard and
Member Profile APIs remain private and return `401` anonymously. This is the
only observed blocker to completing an authenticated Production flow; MFA,
identity provisioning, and operational ownership gates remain unchanged.

## Incremental implementation — shared login rate limiting, 2026-07-29

OIDC login initiation is protected by the shared PostgreSQL rate limiter before
an authorization flow is persisted. The policy permits 10 attempts per
15-minute window per pseudonymized Vercel client address. The database stores
only a scope-separated HMAC, count, and window timestamps; no raw address,
return target, token, or query string is stored. Missing `SESSION_SECRET` fails
closed when authentication is otherwise configured.

The limiter does not replace Auth0 controls, MFA, session expiry, capability
authorization, or trusted-write checks. The live Auth0 callback configuration
remains an external blocker.

## Incremental implementation — request diagnostics, 2026-07-29

The four auth routes now add a server-generated `X-Request-ID` through the
shared `src/platform/request-context.ts` boundary. Existing status codes,
response bodies, redirects, secure cookies, PKCE/state/nonce handling, session
resolution, and trusted-write enforcement remain unchanged. Uncaught failures
fail closed with a stable `500`; the structured operational event records no
exception message, query value, token, identity, or profile payload.

Vercel Production contains all required OIDC variable names in the correct
`res-publica` project. Values were not revealed. The live provider behavior is
recorded in the Production verification section above.

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
