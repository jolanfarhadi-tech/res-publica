# Module: Fellowship

## Incremental Mandatory-hardening Phase-B boundary — 2026-08-16

Role-scope approval, candidacy decision and Fellowship status changes now
require five-minute recent MFA and a distinct server-owned reason code for the
exact transition. Their existing conflict, reviewer/decider and candidate
separation rules remain in place; accepted transitions add session/request/
capability/reason correlation to the same atomic canonical audit records.

## Incremental Release-F integration — 2026-08-16

The central Operations index advertises the Fellowship workspace only for an
active exact `fellowship.operations.read:fellowship` grant at MFA assurance.
The Fellowship API remains independently protected and no review, decision,
conflict or activation boundary changed.

## Purpose

The Civic-domain system for human-gated, non-gamified recognition of bounded
civic responsibility. It supports staff nomination and voluntary application
without turning participation into a score, rank, badge or public status
competition.

## Canonical authority

- `architecture/adr/ADR-002-domain-model.md` — Fellowship references canonical
  Person and AuditLog rather than duplicating identity or accountability.
- `architecture/adr/ADR-003-plugin-architecture.md` — the module owns its tables
  and declares them through one manifest.
- `brain/00_constitution/00_constitution.md` §10 — human-gated,
  non-gamified Fellowship and independent human sign-off.
- `brain/BLUEPRINTS/master-product-blueprint.md` §5 and
  `brain/KNOWLEDGE/operating-system.md` §10 — qualitative nomination,
  internal/private role records and no automatic threshold.

## Current implementation

`src/modules/fellowship/` defines the manifest, types, lifecycle helpers and
domain tests. `src/application/fellowship.ts` implements governed role scopes,
nomination, voluntary self-application/withdrawal, qualitative evidence,
review assignment, conflict declaration and recusal, human recommendation,
independent final decision, private records and explicit status transitions.

Candidate and nominator cannot review or decide; reviewer cannot decide;
conflicted reviewers are recused; approval requires a completed human approval
recommendation. No AI or computed candidate signal is used.

## Data and persistence

Migration `drizzle/0020_fellowship-system.sql` adds nine additive tables. Every
person reference targets canonical `people`. State changes append canonical
AuditLog evidence in the same transaction. There is no score/rank field and no
public profile/directory table.

The repository is verified at 21 migrations / 95 tables. Production remains
at 19 migrations / 66 tables; migration 0020 has not been applied there.

## Authorization and trust boundaries

Every staff write requires same-origin validation, the shared PostgreSQL
limiter, session-derived actor, exact Civic capability/target and MFA.
Self-application requires a verified session and self grant, and fails closed
unless `FELLOWSHIP_APPLICATIONS_ENABLED=true`.

The self dashboard returns only the actor's own candidacies, member-facing
reason and confirmed records. Internal rationale, conflict detail, reviewer
identity and decision notes are not projected. No public Fellow roster exists.

## Interfaces

- Public information: `/[locale]/fellowship` and approved role-scope labels.
- Self: `/[locale]/dashboard/fellowship`, application and withdrawal APIs.
- Staff: `/[locale]/operations/fellowship` plus exact-scope role, nomination,
  assignment, conflict, review, decision and status APIs.

All user-facing copy exists in DE/EN/FA and Persian uses the shared RTL layout.

## Verification

Focused Release-B coverage passed 30 tests. The full repository suite passed
89 files / 367 tests. Lint, typecheck, structure, Drizzle consistency, the
21-migration/95-table fresh database, isolated research 1/6 check and the
processing-inventory drift gate passed before final build preparation.

## Open activation work

OPEN-023 and WARN-021 control activation. Real candidacy processing requires
approved transparency/legal basis, retention/erasure, named independent
operators, approved role scopes, existing-account grant provisioning,
Production migration safety and explicit enablement of
`FELLOWSHIP_APPLICATIONS_ENABLED`.
