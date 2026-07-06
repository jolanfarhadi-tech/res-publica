# Member Profile

```
Type: Project/Product (Member-facing transparency and participation interface)
Status: Substantially specified — architecture only; implementation not started
Version: 1.0
Extends/Reconciles with: brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md (Verification status,
  Privacy Rules), docs/source/academy/RPCS_LEVELS.md, docs/source/academy/RPCS_PROGRAM.md,
  docs/source/projects/COMMUNITY.md, docs/source/methodology/HARM_CODEX.md,
  docs/source/methodology/SCIENTIFIC_REVIEW.md, brain/DOMAIN/CORE_DOMAIN_MODEL.md (Person — LOCKED,
  referenced not modified)
```

## Purpose

Membership Status must not only be internal. Each member shall have access to a personal profile dashboard where they can see their own membership status, verification state, participation pathway, roles, contribution history, certifications, and next possible steps.

**Architectural Rule — stated once, binding throughout this document:** the member profile is a transparency and participation interface. **It is not a governance decision interface.** It allows members to understand their participation journey, but it must not expose sensitive internal review logic or harm-related governance data.

## Mission

To give every member a clear, honest, self-facing view of their own participation journey — without exposing internal review deliberation, risk assessments, or harm-related governance data belonging to other processes.

## Core Principles

1. **Self-facing only** — a member sees their own record; never another member's, and never a comparison against another member's (consistent with Zero Gamification, Core Principle 2, and `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing prohibition on aggregate totals, scores, percentiles, or ranks).
2. **Transparency, not governance** — the profile explains status; it does not make, preview, or imply a governance decision.
3. **Consent-based disclosure** — any status touching the HARM pipeline (Codex Potential, Hearing Candidate) is shown only with the member's consent and only as an opaque status, never with underlying reasoning.
4. **Strict tri-tier visibility separation** — member-facing, internal-administrative, and governance-sensitive information are architecturally distinct tiers, never merged into one view or one data object exposed wholesale.
5. **No gamification** — no points, badges, streaks, leaderboards, or progress-bars-framed-as-scores, consistent with the Constitution and `RESPONSIBILITY_EVIDENCE_MODEL.md` §9 Forbidden Concepts, applied identically here.

## Definitions

**The three visibility tiers:**

1. **Member-facing information** — shown directly to the member, about themselves only.
2. **Internal administrative notes** — never shown to the member; visible only to authorized staff/reviewers.
3. **Governance-sensitive referrals** — never shown to the member as reasoning; at most, an opaque consequence (a status flag) may be shown, per Core Principle 3, and only where explicitly approved.

**Member-facing profile may show:** Membership Status; Verification Status (reusing `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing tri-state Verification status pattern — Submitted/Verified/Rejected-equivalent, never a numeric score); Current Role; Community Pathway; Event Participation; Volunteer Contributions; Academy Progress (per `RPCS_LEVELS.md`'s existing binary met/not-yet-met levels, not a score); Certifications (per `RPCS_CERTIFICATION.md`); Civic Portfolio (the member's own Contribution/Responsibility Evidence history, per `RESPONSIBILITY_EVIDENCE_MODEL.md` §4 — a descriptive list, never an aggregate score); Mentorship Status (reusing RPCS Level 4, "Mentorship / Peer Review"); Fellowship Status (per `COMMUNITY.md`'s Responsibility Community Fellowship); Next Recommended Steps.

**Internal-only information** (never shown to the member, under any circumstance, through this interface): duplicate detection notes (`BASIC_VALIDATION_FRAMEWORK.md`'s Duplicate Detection); reviewer comments (any Reviewer role's working notes, across Responsibility Mapping, Harm Codex, Responsibility Annexes, Scientific Review); risk flags (`EARLY_WARNING.md`'s Risk Assessment dimensions); governance referral reasoning (Scientific Review's Governance Review Gates deliberation, Ethics Board veto reasoning); sensitive evidence notes (`EVIDENCE_MODEL.md`'s Evidence Assessment, Contradiction Management records); harm-related assessment notes (Harm Classification, National Harm Taxonomy category assignment). None of these is redefined here — this document only states that they must not surface through the member profile.

**CODEX POTENTIAL and HEARING CANDIDATE** — two narrow, opaque status flags, shown only if all three conditions hold: disclosure is safe (no re-traumatization or exposure risk), the member has consented to seeing this status, and the disclosure does not expose any sensitive harm-related information. Where shown, these are **status-only** — "your account may be relevant to X" — never accompanied by the harm classification, evidence assessment, scientific review status, or governance reasoning that produced the flag. Consistent with `HARM_CODEX.md`'s existing "explanation only, no data" public-disclosure principle, extended here to a narrower, consent-gated, member-specific disclosure — not a relaxation of that principle.

**Explicit prohibition:** no member-facing profile shall display harm classification, evidence assessment, scientific review status, or governance decisions, unless explicitly approved by the relevant governance process (Scientific Review, Ethics Board, or the applicable governance body) — this is a default-closed rule, not a default-open one requiring an opt-out.

## Framework

**Data sourcing, by tier:**
- Member-facing fields are sourced from: `RESPONSIBILITY_EVIDENCE_MODEL.md` (Verification status, Activity/Contribution records — private fields already, per that document's §6 Privacy Rules, visible to "the Contributor and authorized staff only" — this profile is that Contributor-facing view), `RPCS_LEVELS.md`/`RPCS_PROGRAM.md`/`RPCS_CERTIFICATION.md` (Academy Progress, Certifications), `COMMUNITY.md` (Fellowship Status).
- Internal-administrative fields are sourced from, and remain owned by: Basic Validation Framework, Documentation Quality Review, Scientific Review, Harm Codex, Evidence Model, Early Warning — this document does not duplicate or relocate their data, only excludes it from the member-facing view.
- Governance-sensitive referral status (Codex Potential, Hearing Candidate) is sourced from the HARM pipeline but rendered here only as an opaque flag, per Definitions above.

**Relationship with Other Frameworks:** consumes (read-only, member-scoped) from `RESPONSIBILITY_EVIDENCE_MODEL.md`, `RPCS_LEVELS.md`, `RPCS_PROGRAM.md`, `RPCS_CERTIFICATION.md`, `COMMUNITY.md`. Does not consume from, and never displays, Basic Validation Framework, Documentation Quality Review, Scientific Review, Harm Codex, Evidence Model, or Early Warning's internal working data — only their approved, opaque status consequence where applicable (Codex Potential / Hearing Candidate). None of these is redefined here.

## Workflow

No new lifecycle stage is introduced into the HARM Lifecycle, Scientific Review's pipeline, or any Evidence-related workflow. The Member Profile is a read-only presentation layer over already-existing, already-governed data — it does not gate, approve, or alter any upstream process. Rendering a Codex Potential / Hearing Candidate flag requires an explicit governance-process approval event (per the Explicit prohibition, above) before the flag becomes visible — this approval step belongs to the relevant governance process (Scientific Review / Ethics Board), not to this document.

## Roles

**Member** — views their own profile only. **Platform Administrator** — technical maintenance of the profile interface, no access to elevate visibility tiers. Approval to surface a Codex Potential / Hearing Candidate flag rests with the relevant governance process (Scientific Review Committee / Ethics Board), not with any role defined in this document.

## Inputs

A member's own Verification status, Contribution/Responsibility Evidence records, Academy progress, Certifications, and Fellowship participation; where applicable and approved, an opaque Codex Potential / Hearing Candidate flag.

## Outputs

A personal profile dashboard view, scoped to Member-facing information only (Definitions, above).

## Governance

**Tri-tier visibility separation is a binding architectural constraint, not a configurable preference.** No implementation of this profile may merge the three tiers into a single queryable object exposed to the member-facing interface — internal-administrative and governance-sensitive data must be excluded at the data-access layer, not merely hidden in the UI. Subject to `docs/source/governance/DATA_POLICY.md` and `docs/source/governance/DPIA.md`'s existing data-protection requirements.

## AI Integration

Not specified beyond the general AI Governance boundary (`docs/source/governance/AI_POLICY.md`). Any AI-generated "Next Recommended Steps" content is advisory only and must not infer or surface governance-sensitive information as a side effect (e.g., must not imply harm classification through recommendation phrasing).

## Examples

Reserved — pending approved case material.

## Future Enhancements (not MVP)

Notification preferences; profile export; multilingual profile rendering; accessibility-adaptive profile layout.

## MVP Status

**Current Role:** Member-facing product feature. **Blocking Status:** Non-blocking for the core HARM pipeline — this is a presentation layer, not a governance module. **Implementation Priority:** Not yet assigned a phase. **Current Requirement:** architecture specified (this document); implementation has not started — no profile UI, data-access layer, or tier-separation enforcement exists yet in this repository.

## TODO (implementation — not started)

- [ ] Design the data-access layer enforcing tier separation at the query level, not just the UI level.
- [ ] Define the exact approval workflow for surfacing a Codex Potential / Hearing Candidate flag.
- [ ] Define consent-capture UX for Codex Potential / Hearing Candidate disclosure.
- [ ] Integrate with `RESPONSIBILITY_EVIDENCE_MODEL.md`'s existing Contributor-facing private-field visibility (§6).
- [ ] Define "Next Recommended Steps" generation logic (human-authored templates vs. AI-assisted, per AI Integration above).

## References

`brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`; `docs/source/academy/RPCS_LEVELS.md`; `docs/source/projects/COMMUNITY.md`; `docs/source/methodology/HARM_CODEX.md`

## Related Documents

`../../brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` · `../academy/RPCS_LEVELS.md` · `../academy/RPCS_PROGRAM.md` · `../academy/RPCS_CERTIFICATION.md` · `COMMUNITY.md` · `../methodology/HARM_CODEX.md` · `../methodology/SCIENTIFIC_REVIEW.md` · `../governance/DATA_POLICY.md` · `../governance/DPIA.md`
