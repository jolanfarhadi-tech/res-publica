# ADR-002: Core Domain Model

## Context

The 9 MVP modules were specified by five independent teams working in parallel from a shared brief. That process produced real, working specs quickly, but also produced the same real-world concept defined as a different entity in more than one module: "a person" appeared as Core Platform's `IdentityAccount`, Community's `CommunityMember`, Membership's `Member`, and Events' `Attendee Record`; consent state was defined separately in Core Platform and Community; payment records were defined separately in Membership and (via its now-corrected dependency) Events; and institutional-organization records were defined separately in Membership and CRM. The subsequent Foundation Review found this same pattern recurring even after this ADR's own fix — moderation-queue and Fellowship-nomination entities were independently duplicated between their owning modules and Admin Portal.

## Decision

Extract five canonical entities into a shared `domain/` layer, owned once and referenced everywhere else:

- **Person** — one row per identified individual; module-specific profiles (community standing, membership tier, attendance history) reference it by ID rather than duplicating identity data.
- **ConsentRecord** — purpose-scoped (tracking, invitations, payment processing, event PII), so one person can hold independent consent grants across purposes without needing a separate consent mechanism per module.
- **Payment** — one transaction shape, reused by every module that ever moves money, with one shared payment-provider integration behind it.
- **Organization** — one row per institutional relationship, with a relationship-type field (supporter/partner/funder) since these roles can overlap for the same real organization.
- **AuditLog** — one shared append-only shape (actor, action, target, timestamp) underlying Publishing's sign-offs, CRM's disclosure reviews, and AI Layer's query logging, even though the specific `action` values differ by context.

## Alternatives Considered

- **Let each module keep its own entity and reconcile via periodic sync jobs.** Rejected — sync jobs introduce drift windows and eventual-consistency bugs, which are unacceptable for consent state specifically (a withdrawn consent must take effect everywhere immediately, not after the next sync run).
- **A single monolithic "User" table holding every module's fields.** Rejected — this violates module encapsulation, produces an ever-growing table that every module can accidentally read or write to, and concentrates privacy risk without the compensating benefit of the narrower, purpose-scoped model actually adopted.
- **Accept the duplication as documented, known technical debt.** Rejected — GDPR-correct consent handling specifically requires one authoritative source of truth for what a person has and hasn't agreed to; documented duplication does not satisfy that requirement, it just makes the risk visible without removing it.

## Consequences

Every module's existing spec requires a mechanical (not conceptually difficult) update to reference the canonical entities instead of its own duplicate. The domain layer becomes the single most privacy-sensitive and most-depended-upon part of the codebase, and its access control and test coverage bar should be the highest in the system, not the average. The Foundation Review's own findings (Weaknesses items 1–3) show this discipline needs to be actively re-verified, not assumed self-enforcing, as more modules are specified.

## Future Impact

Every future V2/V3 module (Fellowship, Academy, Store, and the rest) must be checked, before its spec is considered final, against whether it is about to redefine a canonical entity that already exists — this check should be a standing item on the Review & Validation Agent's (ADR-004) checklist, not a one-time cleanup exercise performed only during Foundation phases.

## Amendment (Foundation Stabilization)

Two additions, both resolving Foundation Review findings rather than altering this ADR's original decision:

1. **A sixth canonical entity, `Notification`, has been added** to `domain/notification/` — a shared delivery record (channel, template, recipient reference, delivery status) replacing four independent, implicit send/delivery assumptions previously embedded in Events, Membership, Community, and CRM's own API lists. Those four modules now reference this entity rather than each defining their own mechanism.
2. **The `AuditLog`-vs-GDPR-erasure tension flagged in the Foundation Review has been resolved**: when a referenced `Person` is erased, `AuditLog` entries are pseudonymized (actor/target reference redacted, action/timestamp facts retained) under GDPR Article 17(3)'s accountability-record exception. This is a proposed engineering resolution; the Foundation Review recommends legal/data-protection sign-off before any `AuditLog`-writing module reaches Phase 1, and that recommendation stands alongside this resolution rather than being superseded by it.

The Foundation Review that prompted this amendment also confirmed the pattern this ADR exists to prevent recurred even after this ADR's original fix (`ModerationQueueEntry`/`ModerationQueueItem` and `FellowNomination`/`FellowshipNomination` were each independently duplicated between their owning module and Admin Portal). Both have been corrected in the Master Product Blueprint and Operating System documents. This reinforces rather than changes the original decision: the entity-duplication check needs to be a recurring discipline, not a one-time pass.
