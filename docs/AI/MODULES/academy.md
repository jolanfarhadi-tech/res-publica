# Module: Academy

## Incremental Release-F correction — 2026-08-16

The aggregate staff overview now requires the dedicated exact Civic
`academy.operations.read` capability targeted to `academy` at MFA assurance.
A course-scoped Academy edit/review grant no longer unlocks all courses,
enrollment applications and assessment submissions. The central Operations
index advertises Academy only when this exact grant is active; the Academy API
still performs its own independent authorization. Focused denial/allow and
no-audit-mutation coverage passes within the Release-F 7-file / 26-test set;
the full repository suite passes 99 files / 413 tests.

## Purpose

The Civic-domain learning platform for governed programmes, courses,
curriculum, cohorts, enrollment, learning progress, human-reviewed assessment,
and completion records. It implements Release A without treating RPCS/Civic
School as a commercial product or asserting unverified accreditation.

## Canonical authority

- `architecture/adr/ADR-002-domain-model.md` — canonical Person, Consent and
  Audit entities remain shared authority.
- `architecture/adr/ADR-003-plugin-architecture.md` — module registration and
  ownership boundary.
- `brain/PRODUCTS/product-vision.md`, `brain/MODULE_INDEX.md`, and
  `docs/source/academy/` — source-grounded Academy/RPCS product intent and
  terminology. These sources do not prove current cohorts, instructors,
  accreditation, or completion claims.
- Accepted authorization, authentication, audit, persistence, and privacy ADRs
  remain authoritative for runtime behavior.

## Current implementation

`src/modules/academy/` defines the module manifest, types, lifecycle and domain
tests. `src/application/academy.ts` implements programme/course composition,
review and publication, instructor assignment, four enrollment policies,
application decisions, invitations, progress, assessment review, and
completion issue, public verification, and revocation.

Programme and course lifecycle is
`draft -> review -> approved -> published -> archived`. Review requires a
non-empty governed curriculum. Human boundaries prevent creator approval,
approver publication, applicant review, self-assessment review, self-issuance,
and issuer self-revocation.

## Data and persistence

Migration `drizzle/0019_academy-platform.sql` adds 20 Academy tables. Personal
records reference canonical `people`; canonical `authorization_grants` and
`audit_log` remain shared. Invitation secrets are returned once and only a
SHA-256 token hash is stored. Completion verification identifiers are random,
non-sequential base64url values.

The migration is additive and verified on a fresh local database. It has not
been applied to Production. Repository state is 20 migrations / 86 tables;
Production remains 19 migrations / 66 tables.

## Authorization and trust boundaries

Privileged writes require same-origin request validation, the shared
PostgreSQL rate limiter, an exact Civic capability/target, and MFA. State
changes and canonical audit evidence commit atomically. Learner actions derive
the actor from the authenticated session and fail closed unless
`ACADEMY_ENROLLMENT_ENABLED=true`.

Public projection includes only published governed records. Public completion
verification contains no person, email, membership, session, or authorization
identifier. Academy completion is not represented as state or external
accreditation.

## Public and private interfaces

- Public: `/[locale]/academy`, course/programme detail routes,
  `GET /api/academy/catalog`, and person-free completion verification.
- Learner: `/[locale]/dashboard/academy`, enrollment, progress, and assessment
  submission APIs.
- Staff: `/[locale]/operations/academy` and bounded programme, course,
  instructor, invitation, application, assessment, and completion operations.

All UI copy exists in DE/EN/FA and uses the existing Persian RTL layout.

## Verification

Release-A verification passed 85 test files / 350 tests, lint, typecheck,
structure checks, migration checks, a fresh 20-migration/86-table database,
the processing-inventory drift gate, a 140-page Production build, and
`git diff --check` before commit preparation.

## Open activation work

OPEN-022 and WARN-020 are controlling. Real learner processing requires
approved transparency/legal basis, retention and erasure policy, named
operators, approved source-grounded curricula, Production migration safety,
and an explicit owner decision to enable `ACADEMY_ENROLLMENT_ENABLED`.
