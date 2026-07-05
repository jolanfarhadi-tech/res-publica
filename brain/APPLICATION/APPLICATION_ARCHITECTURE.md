# Res Publica — Application Architecture

**Status: LOCKED — Architecture Baseline.** This document is architecture only — not backend implementation, database schema, API design, dashboard/frontend/UI design, or infrastructure design. This layer sits between the Core Domain Model and future implementation — it defines *how the system behaves*, not how it is stored or displayed. No new domain entity is invented; every service and use case reuses `CORE_DOMAIN_MODEL.md`'s entities and the already-approved 20 modules. As a locked Architecture Baseline, its content may not be modified going forward except through a new ADR or explicit human approval; this lock does not itself change any architecture or redesign anything.

---

# 1. Purpose

The Application Layer's responsibility is to define **behavior**: what happens, in terms of domain operations, when a use case executes — independent of storage technology, API shape, or UI. It separates Domain from Infrastructure by describing *verbs* (Join Community, Publish Article, Submit Responsibility Evidence) that operate on the Core Domain Model's *nouns* (Person, Publication, Responsibility Evidence), without ever specifying a database table, an endpoint, or a screen. Backend, API, Database, Dashboard, and Frontend all later derive from this layer (§8) — none of them are designed here.

---

# 2. Application Services

Each service is scoped to exactly one approved module, per the Plugin Architecture's manifest discipline (`ADR-003`) — no service reaches into another's domain entities directly.

| Service | Owning module | Domain entities touched |
|---|---|---|
| Community Service | Community | `Community`, `Dialogue`, `Responsibility Evidence` |
| Membership Service | Membership System | `Membership`, `Payment`, `ConsentRecord` |
| Academy Service | Academy (V2) | `Learning`, `Responsibility Evidence` |
| Publishing Service | Publishing | `Publication`, `ModerationQueueEntry`, `AuditLog` |
| Research Service | Research Lab (V2) | `Publication`, `Knowledge Asset` — same Research-vs-Publication ambiguity `CORE_DOMAIN_MODEL.md` §11 already disclosed; not resolved here either |
| Event Service | Events | `Event`, `Responsibility Evidence`, `Payment` |
| Fellowship Service | Fellowship System (V2) | `Fellowship`, `Responsibility Evidence` |
| CRM Service | CRM | `Organization` — the conflict-of-interest governance gap `CORE_DOMAIN_MODEL.md` §3d already disclosed is inherited here unresolved |
| Analytics Service | Analytics | `Impact`, `CostGovernanceLedger` (read/aggregate only, never an independent copy) |
| Responsibility Evidence Service | Cross-module (per `RESPONSIBILITY_EVIDENCE_MODEL.md`) | `Responsibility Evidence`, `AuditLog` |
| News Analysis Service | News Analysis Lab (V2) | `Publication`, `Knowledge Asset` — same treatment as Academy/Research/Fellowship Services; no new entity needed |
| Notification Service | **Core Domain Model** (shared infrastructure — cross-cutting, not owned by any single product module; matches `CORE_DOMAIN_MODEL.md`'s own "Core Domain Model" ownership framing for `Notification`, rather than attributing it to a product module) | `Notification` |
| Consent Service | **Core Domain Model** (same cross-cutting reasoning as Notification Service) | `ConsentRecord` |
| Payment Service | **Core Domain Model** (same cross-cutting reasoning; consumed by Membership/Events/Store) | `Payment` |
| Search Service | Knowledge Graph | `Knowledge Asset` |
| AI Service | AI Layer | `Knowledge Asset` (reads/grounds only, per `ADR-008`; never originates or writes domain entities) |

**Deliberately not defined:** a Store Service — `CORE_DOMAIN_MODEL.md` §3d already disclosed that Store's "what is purchased" concept has no approved entity name; a service cannot be meaningfully scoped ahead of that. **Dashboard is not a service** — it is a read-aggregation consumer of the services above (§8), not an owner of its own use cases or domain writes. **Website & CMS is not a service, for the same reason as Dashboard** — it is the public rendering/delivery layer for `Publication`, `Event`, and `Community` outputs produced by other services, not itself an owner of distinct use cases or domain writes. **Admin Portal is not a service — it is a staff-facing consumer/orchestration surface, not an owner of distinct application behavior.** Its own approved scope (moderation, nomination review, editorial inbox, cost telemetry) maps entirely onto entities already owned elsewhere: moderation and editorial inbox → Publishing Service (`ModerationQueueEntry`), nomination review → Fellowship Service (`Fellowship`), cost telemetry → Analytics Service (`CostGovernanceLedger`, read-only). `FOUNDATION_REVIEW_FINAL.md` already confirms this directly — Admin Portal "references Publishing's `ModerationQueueEntry` directly" and "references Fellowship System's `FellowNomination` directly" rather than owning either. No new service or entity is warranted.

**`Project` ownership remains explicitly unresolved at the Application layer, matching `CORE_DOMAIN_MODEL.md` §3b/§11's own unresolved Domain-layer ownership** — no service is assigned to create or manage `Project` records. Resolving Application-layer ownership before Domain-layer ownership is settled would mean deciding the answer here that the Core Domain Model itself deferred; that is out of scope for this document. See §9.

---

# 3. Use Cases

Behavior only — no implementation:

- **Join Community** — a Person, having granted purpose-scoped consent, becomes associated with a Community.
- **Submit Responsibility Evidence** — a Person records a claimed civic contribution with an evidence source; enters "Submitted" state.
- **Verify Responsibility Evidence** — a different, named Person reviews the evidence source and accepts or rejects the claim.
- **Publish Article** — a drafted Publication moves through moderation (if flagged) and human sign-off, then becomes publicly visible.
- **Create Event** — an Event is scheduled by staff, entering the registration-open state.
- **Register for Event** — a Person joins an Event's participant list, subject to consent.
- **Register for Learning** — a Person enrolls in an Academy Learning engagement.
- **Become Member** — a Person or Organization activates a Membership, triggering a Payment.
- **Request Fellowship** — a Person is nominated (human-gated, never scored) for Fellowship review.
- **Search Knowledge** — a query is matched against `Knowledge Asset` via the Search Service.
- **Generate AI Assistance** — a query is routed to the AI Service, which grounds an answer in `Knowledge Asset` or explicitly refuses (`ADR-008`).
- **Grant/Revoke Consent** — a Person creates or withdraws a purpose-scoped `ConsentRecord`.
- **Record Payment** — a transaction is processed for Membership, an Event, or (once resolved) Store.
- **Send Notification** — a `Notification` is dispatched through the Notification Service on behalf of another service's domain event.

---

# 4. Workflows

Generic pattern:

```
User
  ↓
Application Service
  ↓
Domain
  ↓
AuditLog
  ↓
Notification
```

Applied to three concrete use cases:

**Submit → Verify Responsibility Evidence:**
```
Person (Contributor)
  ↓
Responsibility Evidence Service
  ↓
Responsibility Evidence (Domain) — Submitted
  ↓
[Human Verification — a different named Person]
  ↓
Responsibility Evidence (Domain) — Verified/Rejected
  ↓
AuditLog
  ↓
Notification (to Contributor)
```

**Publish Article:**
```
Editor
  ↓
Publishing Service
  ↓
Publication (Domain) — Draft → (ModerationQueueEntry, if flagged) → Signed off → Published
  ↓
AuditLog
  ↓
Notification (to subscribers, if applicable)
```

**Become Member:**
```
Person
  ↓
Membership Service → Payment Service
  ↓
Membership (Domain) — Activated
  ↓
AuditLog
  ↓
Notification (confirmation)
```

No implementation, storage, or transport mechanism is specified.

---

# 5. Permissions

Reusing `AGENT_SKILL_PLUGIN_ARCHITECTURE.md` §7's Permission Matrix directly — no new permission levels invented.

| Use case | Permission level(s) involved |
|---|---|
| Join Community, Register for Event/Learning | Draft → Modify Content (self) |
| Submit Responsibility Evidence | Draft |
| Verify Responsibility Evidence | Modify Content (reviewer only, never the submitter) |
| Publish Article | Modify Content + human sign-off (publish approval) |
| Create Event | Modify Content (staff) |
| Become Member / Record Payment | Modify Content + **Access Financial Data** |
| Request Fellowship | Suggest Only (nomination) → Modify Content (human grant) |
| Search Knowledge / Generate AI Assistance | Read Only |
| Grant/Revoke Consent | Modify Content (self) |
| Send Notification | Modify Content (system-triggered) |

---

# 6. Human Approval

Reusing Constitution §8's Human Approval Gates list directly — no new gate invented.

| Use case | Human Approval Gate triggered |
|---|---|
| Verify Responsibility Evidence | Responsibility Evidence logic (any form) |
| Publish Article | Public communication |
| Become Member / Record Payment | Payment processing changes |
| Grant/Revoke Consent | User data access changes |
| Any use case touching a new dependency, plugin, or schema-adjacent change | Dependencies / Plugins / Database schema changes (as applicable at implementation time, not designed here) |

All other use cases (Join Community, Search Knowledge, Register for Event/Learning) do not themselves trigger a standing Human Approval Gate — they inherit the ordinary sign-off/consent rules already defined in the Core Domain Model's invariants (§9 of that document).

---

# 7. Cross-Module Communication

Modules communicate exclusively through the manifest contract already established by the Plugin Architecture (`ADR-003`): a service declares which Core Domain Model entities it reads or writes, and Core Platform wires access accordingly — no service imports or directly calls another service's internals. Where one service's action needs to inform another (e.g., a completed Event should inform the Community Service's participation ladder, per `ADR-009`'s existing "downstream never blocks upstream" rule), this happens via the conceptual Domain Events already named in `CORE_DOMAIN_MODEL.md` §8 (e.g., "Event Completed"), not via direct synchronous coupling. This is consistent with, not a redefinition of, the existing Integration Map (`foundation-architecture.md` §7).

---

# 8. Future Derivations

Dependency only — none of the following is designed here:

- **Backend** will implement each Application Service as a concrete service module, operating on the Core Domain Model's persisted representations.
- **API** will expose each use case as an operation, respecting the same Permission Matrix and Human Approval Gates defined in §§5–6.
- **Database** will persist the Core Domain Model entities each service touches, per the ownership already assigned in `CORE_DOMAIN_MODEL.md` §3.
- **Dashboard** will read aggregated, privacy-filtered views spanning multiple services (it is a consumer, not a service, per §2).
- **Frontend** will render the use cases in §3 as user-facing interactions.
- **AI orchestration** will implement the AI Service's grounding/citation-or-refuse behavior concretely, per `ADR-008`.

---

# 9. Validation

- **Compatible with Constitution:** Yes — every Human Approval Gate and permission level reused directly from §§5–6's sources; no new rule invented.
- **Compatible with Foundation:** Yes — services map 1:1 onto approved modules; no module renamed or redefined.
- **Compatible with Core Domain Model:** Yes — no new domain entity invented; every service's "entities touched" column is drawn directly from `CORE_DOMAIN_MODEL.md` §3.
- **Compatible with approved ADRs:** Yes — `ADR-003` (manifest contract), `ADR-007` (Knowledge Graph), `ADR-008` (AI Layer), `ADR-009` (integration map) all referenced consistently.
- **Compatible with Responsibility Evidence:** Yes — the Responsibility Evidence Service and its two use cases (Submit/Verify) match `RESPONSIBILITY_EVIDENCE_MODEL.md` §5's workflow exactly; its pending-ADR status is inherited, not resolved here.
- **Compatible with AI Capability Architecture:** Yes — the AI Service is scoped to reading/grounding only, consistent with `AGENT_SKILL_PLUGIN_ARCHITECTURE.md`'s treatment of the AI Layer as a service, not an entity.

**Ambiguities identified, not resolved:**
1. Research Service vs. Publishing Service overlap — inherits `CORE_DOMAIN_MODEL.md` §11's unresolved Research-vs-Publication distinction; not decided here.
2. Store Service is undefined pending resolution of Store's entity gap (`CORE_DOMAIN_MODEL.md` §3d).
3. CRM Service's conflict-of-interest governance behavior is undefined for the same reason (`CORE_DOMAIN_MODEL.md` §3d).
4. Whether Dashboard should ever become a true Application Service (rather than a pure read-aggregation consumer) — e.g., if it needs its own write-side preferences/settings behavior — is not resolved here; treated as out of scope for this pass.
5. **`Project` has no assigned Application Service**, matching the Core Domain Model's own unresolved Domain-layer ownership (`CORE_DOMAIN_MODEL.md` §3b/§11) — deliberately left unresolved here rather than settled at the Application layer ahead of the Domain layer.
6. **Website & CMS**, like Dashboard, is treated as a rendering/consumer layer rather than a service with its own use cases — this is a judgment call, not a decision compelled by any approved document, and could be revisited if Website & CMS is ever found to need its own distinct write-side behavior.

---

Not committed. Stopping here for Architecture Review.
