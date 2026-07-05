# Res Publica — Core Domain Model

**Status: architecture only. Not backend design, not database design, not dashboard/API/UI design, not implementation.** This is the canonical conceptual domain model from which Backend, Dashboard, API, AI, and Frontend will later be derived — none of that derivation happens in this document. No approved document is modified. No new ADR is created.

---

# 1. Purpose

The Core Domain Model is the single, shared definition of what "things" exist in Res Publica's world — Person, Project, Publication, and so on — and how they relate, independent of how any future module stores, exposes, or renders them. Every future module must derive its own data structures *from* this model rather than independently inventing a parallel definition of the same real-world concept.

This is not a new discipline — `ADR-002` already established it for the platform's original 5 (now 6) canonical entities, precisely because the Foundation Review caught the same real concept (a person, a moderation queue entry, a fellowship nomination) being independently and inconsistently redefined by different module specs, more than once. This document extends that same discipline to the full entity set Phase 1 actually needs, rather than leaving each future module to rediscover the problem `ADR-002` already solved.

---

# 2. Domain Principles

- **Accountability First** — every entity representing an action or decision traces to a named human (Constitution §3).
- **Human-Centered** — entities model real people and real civic relationships, never abstract engagement metrics.
- **Evidence-based** — claims about what happened are backed by verifiable evidence, not assumed (`RESPONSIBILITY_EVIDENCE_MODEL.md`).
- **Privacy by Design** — default visibility is the most restrictive one consistent with purpose (Core Principle 3; `RESPONSIBILITY_EVIDENCE_MODEL.md` §6).
- **Explainability** — every AI-touched entity or output traces to a source (Core Principle 1; `ADR-008`'s citation-or-refuse).
- **Modularity** — entities are shared and canonical; modules reference them, never duplicate them (`ADR-002`/`ADR-003`).
- **Zero Gamification** — no entity carries a score, rank, or comparative value (Core Principle 2).
- **AI as Assistant** — AI-related capabilities support human decision-making; they never originate an institutional position (Core Principle 1).
- **Human Approval** — entities representing institutional actions require a human approval step before taking effect (Constitution §16).

---

# 3. Canonical Domain Entities

## 3a. Already approved — reused as-is (`ADR-002`, `foundation-architecture.md` §2)

| Entity | Purpose | Owner | Lifecycle | Visibility | Privacy Level |
|---|---|---|---|---|---|
| Person | One row per identified individual | Core Domain Model | Created on first identified interaction; persists | Self + authorized staff | High (PII) |
| ConsentRecord | Purpose-scoped, revocable consent grant | Core Domain Model | Created on consent; revocable | Self + authorized staff | High |
| Payment | One transaction shape, reused by every money-moving module | Core Domain Model | Created per transaction; immutable once settled | Self + authorized staff | High (financial) |
| Organization | One row per institutional relationship (supporter/partner/funder/sponsor via relationship-type) | Core Domain Model | Created on first relationship; persists | Staff | Medium |
| Notification | Shared delivery record (channel, template, recipient, status) | Core Domain Model | Created per send; append-only | Self + authorized staff | Medium |
| AuditLog | Append-only actor/action/target/timestamp record | Core Domain Model | Created per institutional action; never edited (pseudonymized on erasure) | Authorized staff only | High |

## 3b. New — justified by approved module scope (Master Product Blueprint)

| Entity | Purpose | Owner | Lifecycle | Visibility | Privacy Level |
|---|---|---|---|---|---|
| Community | A distinct language/locale context (German/English/Farsi, or a specific local group) | Community module | Created per active community context; long-lived | Public for large/general groupings; **restricted by default for small or sensitive groupings** (see Fix note below) | Low for general groupings; **Medium for small/sensitive groupings** — a narrowly-scoped community's membership or existence can indirectly identify at-risk participants, given `MISSION.md`'s explicit Farsi-diaspora safety stakes |
| Project | A bounded civic initiative or effort grouping related activity | **Unresolved — no single approved owner.** No approved document assigns Project to one module; flagged as an open ambiguity rather than resolved here (see §11) | Created at initiative start; closed on completion | Staff, contributors | Low–Medium |
| ModerationQueueEntry | A content item pending editorial/moderation review | Publishing module (confirmed in `FOUNDATION_REVIEW_FINAL.md`'s resolution table — Admin Portal references this entity directly rather than redefining it) | Created on submission; resolved on moderation decision | Staff only | Medium |
| CostGovernanceLedger | The raw, per-query AI spend/usage record | AI Layer module (`FOUNDATION_REVIEW.md`; `ADR-008`) | Created per AI query; append-only; Analytics reads and aggregates it but does not maintain an independent copy | Staff only | Medium |
| Dialogue | A structured citizen-dialogue session (Bürgerdialog format) | Community module | Scheduled → held → outcome published | Public (outcome), restricted (participant detail) | Medium |
| Learning | A course/curriculum engagement | Academy (V2) | Enrolled → in progress → completed | Self + staff | Medium |
| Publication | A published content unit (news, research finding, policy position, report) | Publishing module | Drafted → signed off → published | Public once published | Low |
| Event | A scheduled event with lifecycle (registration, Q&A, outcome) | Events module | Scheduled → held → outcome published | Public (event), restricted (registrant detail) | Medium |
| Membership | A recurring individual/institutional support relationship | Membership System | Activated → renewed/lapsed → ended | Self + staff | Medium (financial-adjacent) |
| Fellowship | Human-gated recognition of a top-tier contributor | Fellowship System (V2) | Nominated → reviewed (human) → granted | Public (grant), restricted (nomination detail) | Medium |
| Impact | A recorded, qualitative civic-effect outcome | Analytics module | Recorded per completed activity; aggregated for reporting | Aggregate public, individual-linked restricted | Medium |
| Knowledge Asset | **A derived, read-only index representation of a Publication or Dialogue outcome — not an independent primary record.** It has no write authority of its own; it is regenerated deterministically from the owning entity's committed content by the Knowledge Graph's extraction pipeline (`ADR-007`). Clarified explicitly to avoid being read as a duplicate of `Publication`. | Knowledge Graph module (`ADR-007`) | Extracted deterministically from committed content; updated on rebuild; never independently edited | Public | Low |
| Responsibility Evidence | A verified record of a specific civic contribution | Cross-module (per `RESPONSIBILITY_EVIDENCE_MODEL.md`) | Created → submitted → verified/rejected → logged | Self + authorized reviewer | Medium–High |

**Note on Responsibility Evidence's approval status:** `RESPONSIBILITY_EVIDENCE_MODEL.md` §10 itself recommends this capability proceed via a **future ADR**, not immediate implementation. It is included here as a referenced entity because this document's own instructions list it as a required reference — its formal ratification is still pending and is out of this document's scope to grant.

## 3c. Explicitly rejected as standalone entities (already covered, or not yet approved)

| Example given | Disposition | Reasoning |
|---|---|---|
| Responsibility | Rejected, standalone | The evidence itself (Responsibility Evidence) is the entity; "Responsibility" as a separate abstract concept has no independent justification. |
| Partner | Rejected, standalone | Already covered — `Organization`'s relationship-type field already includes "partner" (`ADR-002`). |
| Sponsor | Rejected, standalone | Already covered by `Organization`'s relationship-type field; the underlying "Sponsor Marketplace" module itself is Future Proposal, not approved (`EXECUTION_ALIGNMENT.md`). |
| Environmental Initiative | Rejected, not yet approved | "Environmental Impact Platform" is Future Proposal, not an approved module (`EXECUTION_ALIGNMENT.md`). |
| AI Assistant | Rejected, standalone | The AI Layer is a service/capability (`ADR-008`), not a domain entity with its own lifecycle/ownership; its outputs reference `Knowledge Asset`, but the service itself isn't part of the entity list. |
| Policy | Rejected, standalone | A policy position paper is a `Publication` — no distinct entity is justified beyond that. |
| Decision | Rejected, standalone | Not named anywhere in approved Master Product Blueprint; no current module requires it as a distinct entity. |
| Research (as distinct from Publication) | Folded into Publication / Knowledge Asset | Research Lab's studies are published outputs — covered by `Publication`; no separate entity is currently justified. |

## 3d. Open gaps — not resolved by invention

Two approved modules have real domain needs with no approved entity name to reuse. Per this revision's constraint against inventing new concepts, these are left explicitly marked rather than resolved:

- **Store (V2, approved module)** — "event tickets, paid courses, publication editions, methodology licenses" (`MODULE_INDEX.md`). The transactional side is already covered by the approved `Payment` entity. **The "what is being purchased" concept has no approved entity name anywhere in Brain** — not resolved here; would need its own future ADR or Master Product Blueprint elaboration before Store is detailed to build-ready depth.
- **CRM's "conflict-of-interest governance"** (`MODULE_INDEX.md`'s own description of the CRM module) — the donor/partner/funder relationship side is covered by `Organization`, but **the disclosure/governance mechanism itself has no approved entity name anywhere in Brain**. Not resolved here.

---

# 4. Relationships

```
Person
  ↓ gives (opt-in, purpose-scoped)
ConsentRecord
  ↓ scopes participation in
Community / Project / Event / Membership

Person
  ↓ performs (within a Community, via a Module)
Responsibility Evidence
  ↓ verified by (a different) Person
  ↓ belongs to
Project / Event / Dialogue / Publication
  ↓ contributes to
Impact

Organization
  ↓ relates to (supporter / partner / funder / sponsor)
Person / Project / Event

Publication / Dialogue outcome / Research finding
  ↓ indexed as
Knowledge Asset
  ↓ grounds
AI Layer answers (a service, not an entity)

Person
  ↓ nominated for (human-gated, never scored)
Fellowship

Person
  ↓ enrolls in
Membership

Every institutional action
  ↓ recorded in
AuditLog
```

Described conceptually only — no field-level or storage-level detail is implied.

---

# 5. Aggregate Roots

- **Person** — independent identity and lifecycle; every other entity that references an individual does so by pointing to a Person, never the reverse. Root because consent, evidence, membership, and fellowship are all meaningless without an owning Person.
- **Project** — groups related Dialogue, Event, and Publication instances under one initiative; has its own lifecycle independent of any single contributor. Root because a Project can outlive any individual contributor's involvement in it.
- **Organization** — independent identity for institutional relationships; Person and Project reference it, not the reverse. Root because a funder/partner relationship has its own lifecycle separate from any one project or person.
- **Community** — independent identity and lifecycle (a language/locale context exists and persists independent of any one Person, Project, or Event within it); other entities reference a Community, not the reverse. Root for the same structural reason as Person, Project, and Organization.

---

# 6. Bounded Contexts

Justified by approved architecture: **Community, Academy, Research, Publishing, AI, Events, Membership, Impact, Fellowship, CRM.**

**Not included:** *Business* — "Business Blueprint" is itself still Future Proposal (`EXECUTION_ALIGNMENT.md` Command 10); no approved module currently defines a discrete Business bounded context. *Environment* — "Environmental Impact Platform" is Future Proposal, not approved. Neither is designed here; if either is approved later, its bounded context would be added at that time, not anticipated now.

---

# 7. Shared Concepts

Shared across **every** bounded context: `Person`, `Organization`, `AuditLog`, `ConsentRecord`, `Notification`, `Payment` (the already-approved canonical six). Shared across Publishing, Research, and AI specifically: `Knowledge Asset`. Shared across Community, Academy, Research, Publishing, and Events: `Responsibility Evidence`, wherever human contribution needs recording.

---

# 8. Domain Events

Person Joined · Consent Granted · Consent Revoked · Evidence Submitted · Evidence Verified · Evidence Rejected · Publication Signed Off · Event Completed · Membership Activated · Membership Lapsed · Fellowship Nominated · Fellowship Granted · Impact Recorded.

Described conceptually only — no event schema, queue technology, or handler design is implied.

---

# 9. Invariants

- Evidence cannot become Verified without a named human Reviewer distinct from the Contributor (Constitution §3; `RESPONSIBILITY_EVIDENCE_MODEL.md` §4–5).
- No institutional action (a Publication sign-off, a Payment, a Membership activation) occurs without a corresponding `AuditLog` entry (Constitution §3/§7).
- No entity carries a numeric score, rank, or value derived by comparing one Person's data to another's (Core Principle 2).
- A `ConsentRecord` is purpose-scoped; consent for one purpose never implies consent for another (`ADR-002`; Core Principle 3).
- `AuditLog` is append-only; existing entries are never edited, only pseudonymized on erasure per the already-approved GDPR pattern (`ADR-002` amendment).
- Every AI-Layer-grounded answer cites a `Knowledge Asset` or explicitly refuses (Core Principle 1; `ADR-008`).

---

# 10. Future Derivations

Dependency only — none of the following is designed here:

- **Database** will implement these entities as persisted structures.
- **Backend** will implement services operating on them.
- **Dashboard** will read privacy-filtered, aggregated views of them.
- **API** will expose operations respecting the same visibility/privacy rules defined here.
- **Frontend** will render views derived from Backend/API, not from this document directly.
- **AI** will consume `Knowledge Asset` and produce citations; it does not originate entities (Core Principle 1).
- **Analytics** will read `Impact` and aggregate, anonymized `Responsibility Evidence` data — never per-person scores.
- **Responsibility Evidence**, once its own ADR is approved, becomes a concrete extension of `AuditLog` exactly as already specified in `RESPONSIBILITY_EVIDENCE_MODEL.md` §7 — this document does not re-specify it.

---

# 11. Validation

- **Compatible with Constitution:** Yes — every principle in §2 traces to a specific Core Principle or Constitution §N.
- **Compatible with Foundation:** Yes — reuses `foundation-architecture.md` §2's 6 canonical entities as the base; does not contradict or redefine them.
- **Compatible with approved ADRs:** Yes — `ADR-002`, `ADR-003`, `ADR-004`, `ADR-007`, `ADR-008` are all referenced consistently, none contradicted.
- **Compatible with Responsibility Evidence:** Yes — included exactly as specified in `RESPONSIBILITY_EVIDENCE_MODEL.md`, with its pending-ADR status carried forward honestly rather than treated as settled.
- **Compatible with AI Capability Architecture:** Yes — the AI Layer is treated as a service/capability, not a domain entity, consistent with `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`'s own framing.

**Ambiguities identified, not resolved:**
1. Whether **Dialogue** is a distinct entity or a specialization of **Event** is not resolved by any approved document — both readings are defensible; this document does not decide it.
2. Whether **Research Lab**'s studies eventually need their own entity beyond `Publication`/`Knowledge Asset` is not resolved — current approved content doesn't distinguish them, but this may change once Research Lab is detailed to build-ready depth (it currently is not, per `ROADMAP.md`).
3. **Responsibility Evidence**'s formal approval is still pending its own ADR — this model treats it as a reference entity, not a ratified one; that ratification is a separate, future decision.
4. **Business** and **Environment** bounded contexts are explicitly absent pending their own approval — if approved later, this document would need a corresponding update, which is out of scope here.
5. **`Project`'s owner is unresolved** — no approved document assigns it to a single module; left explicitly marked (§3b) rather than invented, per this revision's constraint. A future ADR should assign single-owner authority before Project reaches implementation, to avoid the ambiguous-ownership failure mode Foundation Review already caught twice (moderation queue, fellowship nomination).
6. **Store's "what is purchased" concept and CRM's conflict-of-interest governance mechanism** have no approved entity name anywhere in Brain (§3d) — not resolved here; each needs its own future ADR or Blueprint elaboration.

---

Not committed. Stopping here for Architecture Review.
