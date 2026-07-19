# ADR-026: Constitutional Domain Architecture — Civic Domain, Governance Domain, and Shared Platform Services

## Status

Accepted — explicitly approved by the Founder on 2026-07-19.

## Classification

**Constitutional / architectural governance decision.** This ADR defines ownership, responsibility, and governance boundaries only. It is explicitly **not** a deployment architecture, not a runtime architecture, and not a microservices architecture — it says nothing about how or where anything executes, is hosted, or is network-separated. It does not modify any implementation code and does not amend, unlock, or contradict any LOCKED document (`brain/DOMAIN/CORE_DOMAIN_MODEL.md`, `brain/APPLICATION/APPLICATION_ARCHITECTURE.md`).

## Context

Two architectural tracks were built independently in this repository: the `brain/` civic-platform track (Person, Membership, Community, the 20-module Master Product Blueprint) and the `docs/source/` HARM/accountability-governance track (AHIP intake, Structured Hearings, Evidence Model, Scientific Review, Harm Codex, Repair Framework, Civic Intelligence). `docs/source/COMPATIBILITY_MAP.md` confirms no direct contradiction exists between them but that they were cross-referenced only partially. `brain/MODULE_INDEX.md` — the repository's own module index — never lists a single HARM-track item; the two tracks have never shared one planning document.

An architectural review of a proposed three-way ownership split (Civic / Governance / Shared) found the underlying problem real and a constitutional, responsibility-level split directionally sound. That review also found that several architectural details — spanning entities and capabilities referenced by more than one domain — are not yet resolved by any existing document. This ADR resolves only the constitutional question: which domain is responsible for which area of the platform. It deliberately does not resolve any architectural detail, however closely related, leaving each such question to its own dedicated ADR.

## Decision

Res Publica is constitutionally organized into three domains.

### 1. Civic Domain

Responsible for: participation, membership, community, academy, projects, and organizational growth.

This responsibility area corresponds to the existing civic-track modules already named in `brain/MODULE_INDEX.md` and `brain/BLUEPRINTS/mvp-module-blueprint.md` (Community, Membership System, Academy, and related modules) and to the Civic-side canonical entities in `CORE_DOMAIN_MODEL.md` §3a/3b. This ADR does not restate, re-derive, or alter that entity list — it assigns responsibility at the domain level only.

### 2. Governance Domain

Responsible for: Harm, Evidence, Hearings, Repair, Responsibility, Scientific Review, Civic Intelligence.

This responsibility area corresponds to the existing HARM-track methodology documents (`docs/source/methodology/EVIDENCE_MODEL.md`, `REPAIR_FRAMEWORK.md`, `RESPONSIBILITY_MAPPING.md`, `RESPONSIBILITY_DASHBOARD.md`, `CIVIC_INTELLIGENCE.md`, `HARM_CODEX.md`, and `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`). As with Civic Domain, this ADR assigns responsibility at the domain level only — it does not restate or alter any of those documents' own content.

### 3. Shared Platform Services

Responsible only for reusable infrastructure. Shared Platform Services owns no business policy and no business semantics. Business semantics always belong to either Civic Domain or Governance Domain.

## Constitutional Ownership Boundaries

- Every capability's business responsibility belongs to exactly one of the three domains above.
- Shared Platform Services may provide underlying generic mechanisms; it may never decide what those mechanisms mean for either domain's business concerns.
- Civic Domain and Governance Domain are constitutional peers. Neither replaces or subsumes the other.
- Cross-domain interaction is intended to occur through well-defined interfaces, not direct reach-through into another domain's internals — the specific form of those interfaces is architectural detail, not defined here.

## Deferred Scope

The ownership and architecture of all cross-domain entities, cross-cutting capabilities, and shared infrastructure are intentionally deferred to dedicated ADRs. This ADR establishes only constitutional ownership boundaries and does not resolve implementation architecture or detailed ownership models.

This ADR additionally does not define a deployment topology, service boundary, network boundary, or microservices split. `ADR-003`'s rejection of per-module microservices (on 1–3 engineer team operational-overhead grounds) remains fully in force and unaffected — this ADR operates one layer above that concern, not in tension with it.

## Consequences

- Every deferred topic is resolved by a dedicated, tracked ADR (see Related Documents), not left as undocumented ambiguity.
- No file under `scripts/eao/**`, `src/**`, or any LOCKED document is modified by this ADR.
- `CORE_DOMAIN_MODEL.md`'s existing entity table, aggregate roots, and stated open ambiguities remain entirely as written — this ADR does not amend them. Any future amendment to that document must remain compatible with the domain boundaries established here.
- Future architectural work should reference this ADR when determining which domain a new capability's business responsibility belongs to, and should reference the relevant dedicated ADR — rather than inventing an answer here — for any question this ADR defers.

## Alternatives Considered

- **Resolve cross-domain ownership questions within this ADR.** Rejected — this would conflate the constitutional (ownership/responsibility) layer with detailed architecture, which is a separate concern properly resolved by its own dedicated ADRs, each with the space to weigh its own tradeoffs.
- **Defer the constitutional question itself until every cross-cutting detail is resolved first.** Rejected — the responsibility boundary between the three domains is separable from, and does not need to wait for, the detailed architecture of any one cross-cutting capability.

## Human Approval Record

Approved by the Founder on 2026-07-19 with the explicit instruction:

> “ADR‑026 — Civic Domain, Governance Domain und Shared Platform Services —
> wird als Founder-Entscheidung akzeptiert. Der Status darf auf Accepted
> gesetzt und der Approval Record ergänzt werden.”

This approval accepts the three-domain constitutional responsibility model
defined in this ADR. It does not independently accept any separately gated
follow-up ADR or activate a legal, privacy, deployment, or implementation
decision outside this document's stated scope.

## References

`brain/DOMAIN/CORE_DOMAIN_MODEL.md` (LOCKED, unmodified); `architecture/adr/ADR-001-core-platform.md`; `architecture/adr/ADR-002-domain-model.md`; `architecture/adr/ADR-003-plugin-architecture.md`; `brain/MODULE_INDEX.md`; `docs/source/COMPATIBILITY_MAP.md`; `docs/source/methodology/EVIDENCE_MODEL.md`; `docs/source/methodology/REPAIR_FRAMEWORK.md`; `docs/source/methodology/RESPONSIBILITY_MAPPING.md`; `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md`; `docs/source/methodology/CIVIC_INTELLIGENCE.md`; `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`.

## Related Documents

Dedicated ADRs addressing deferred architectural questions exist under `architecture/adr/`. This document intentionally does not enumerate them by name, number, or topic, so that this constitutional ADR remains stable as those dedicated ADRs are added, removed, merged, or renamed.
