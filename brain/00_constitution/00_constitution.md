# Res Publica — Accountability Constitution

**Status: APPROVED v1.0.** Drafted, reviewed (`CONSTITUTION_REVIEW.md`), revised (Revision Pass v1), re-reviewed with zero critical findings (`CONSTITUTION_REVIEW_2.md`), and approved by the Human Approval Authority (Section 16) — consistent with how Foundation Architecture v1.0 itself was handled (drafted, reviewed, stabilized, re-reviewed, then approved — see `../../FOUNDATION_REVIEW.md` / `../../FOUNDATION_REVIEW_FINAL.md`). This Constitution is now binding at the full authority Section 1 describes, within its stated conduct/accountability domain (Section 6).

*Canonical source: Project Brain v1.1 (commit `7d39c71`, tag `project-brain-v1.1`), frozen per `ADR-011-phase-0-start.md`. This revision introduces no new architecture, no new domain entities, and no restatement of anything Project Brain already owns canonically. It resolves every finding in `CONSTITUTION_REVIEW.md` by clarifying, consolidating, and — where the review found a genuine gap (ADR workflow, Plugin Governance, Human Approval Authority, Ecosystem Accountability) — adding new, narrowly-scoped sections. Nothing in Project Brain's frozen v1.1 content was changed to produce this revision.*

*Scope note: `../CONSTITUTION.md` (8 principles) is incorporated by reference as this Constitution's Core Principles (Section 2), unchanged.*

---

## 1. Purpose

**Purpose.** To establish a single, highest-authority governing document for Res Publica's accountability, so that every future phase, module, and contribution has one place to check "is this allowed" that outranks any other document — within the specific domain this Constitution governs.

**Rules.**
- This Constitution, once approved, is the highest authority for **conduct and accountability matters**: who is answerable, what evidence compliance requires, how compliance is checked, and who may approve what. No document may contradict it on these matters.
- Approved ADRs and the Foundation Architecture remain the highest authority for **architecture and domain-model matters**: what is built and how it behaves. This Constitution does not override them there.
- Section 6 (Decision Hierarchy) states the precise test for classifying a rule into one domain or the other, and the joint-adoption rule for a rule that is genuinely both. This resolves what the first review (`CONSTITUTION_REVIEW.md` §2) identified as an unqualified-authority contradiction between this section and Section 6 — the two are now explicitly co-scoped, not competing.
- It does not redesign, redefine, or contradict anything already approved in Foundation Architecture v1.0 or Project Brain v1.1.

**Required Evidence.** The existence of this file, versioned and tagged, at `brain/00_constitution/00_constitution.md`.

**Validation Criteria.** Every future Phase deliverable states explicit compliance with this Constitution (Section 15) before being marked complete.

**Future Engine Mapping.** Responsibility Agent (constitutional-principle compliance, `../AGENTS/ecc-agent-system.md`); Review & Validation Agent (pre-completion checks); Human Approval Authority (Section 16).

---

## 2. Core Principles

**Purpose.** To state, by reference, the substantive principles this Constitution's accountability machinery exists to enforce.

**Rules.**
- The 8 principles in `../CONSTITUTION.md` are the Core Principles, incorporated by reference, unchanged: (1) AI never originates an institutional position; (2) zero gamification, anywhere; (3) personalization is opt-in, anonymous use always preserved; (4) success measured by civic effect, never attention; (5) the Static Core stays untouched and fast, AI/identity layered beside it; (6) offline-first is platform-wide, not a local-dev convenience; (7) trilingual discipline is genuine re-narration, not flat translation; (8) nonprofit resourcing realism governs every architectural choice.
- This section restates none of their detail — see `../CONSTITUTION.md` directly.

**Required Evidence.** `../CONSTITUTION.md` itself, unmodified, at its current frozen v1.1 content.

**Validation Criteria.** Any feature or module reviewed under Section 15 must show explicit non-violation of each of the 8 principles, not merely "no obvious conflict."

**Future Engine Mapping.** Responsibility Agent (primary); Design System Agent (principle 2); Local Dev Agent and CLI Agent (principles 5, 6).

---

## 3. Accountability Model

**Purpose.** To define who is answerable for every institutional action the platform takes, and what happens when that answerability is tested.

**Rules.**
- **Canonical sign-off rule (this is the single source for this rule; Sections 5 and 10 reference it rather than restating it).** Every institutional output (a publish, a payment, a consent change, a moderation decision) must trace to a named human, recorded in `AuditLog` (actor, action, target, timestamp — `../BLUEPRINTS/foundation-architecture.md` §2; `../../architecture/adr/ADR-002-domain-model.md`). No institutional action may be attributed to "the system" or "the AI" alone.
- **Conflict of interest.** A contributor may not be the named human sign-off for their own contribution. The accountable signer must be a different, identifiable person from the drafter/actor being signed off on.
- **Consequence, not just traceability.** A confirmed violation of this Constitution triggers a mandatory case review by the Human Approval Authority (Section 16). Consequences are decided case-by-case there, proportionate to the violation — this Constitution does not prescribe a fixed penalty schedule, since doing so at this project's current scale (1–3 engineers) would be disproportionate process (Core Principle 8), but every confirmed violation is reviewed by a named human, never silently logged and ignored.
- **Audit sampling — measurable.** `AuditLog` entries are sampled by the Human Approval Authority (or an explicit delegate) at least once per calendar month, covering a minimum of 10% of that month's institutional actions, or all of them if fewer than 20 occurred. Results (pass/fail counts, any escalations) are recorded alongside the sample.

**Required Evidence.** An `AuditLog` entry for every institutional action, with a non-null human actor reference distinct from the action's own drafter; a monthly audit-sample record.

**Validation Criteria.** A sampled audit of `AuditLog` entries shows 100% named-human coverage for institutional outputs, zero self-sign-offs, and a monthly sample record exists for every month since this Constitution's approval.

**Future Engine Mapping.** `AuditLog` (Core Domain Model); Publishing module's sign-off flow (`../BLUEPRINTS/mvp-module-blueprint.md` §3); Review & Validation Agent; Human Approval Authority (Section 16).

---

## 4. Rights

**Purpose.** To state what every visitor, participant, and contributor is entitled to, independent of what any specific module later implements.

**Rules.**
- The right to full anonymous use — no feature may require identity disclosure to deliver its core value (Core Principle 3).
- The right to purpose-scoped, revocable consent — a `ConsentRecord` grant in one purpose (e.g., tracking) never implies consent in another (e.g., payment processing) (`../../architecture/adr/ADR-002-domain-model.md`).
- The right to erasure — honored via the pseudonymization-on-erasure pattern (actor/target redacted, action/timestamp retained under GDPR Art. 17(3)) that ADR-002's amendment proposes, **pending the legal/data-protection sign-off `../ROADMAP.md` and `../../FOUNDATION_REVIEW_FINAL.md` both flag as an open Phase 1 prerequisite** — this right is not yet fully closable until that sign-off exists. A disputed erasure request is escalated to the Human Approval Authority (Section 16), not resolved unilaterally by whichever engineer receives it.
- The right to a grounded answer or an explicit refusal — never an AI answer presented with false confidence and no citation (Section 12).

**Required Evidence.** `ConsentRecord` entries per purpose; erasure-request logs; the legal sign-off document once it exists (currently absent — see above).

**Validation Criteria.** No feature audited under Section 15 requires identity disclosure for its core value; no erasure request left unresolved beyond the pattern ADR-002 defines, or left undecided by the Human Approval Authority beyond 30 days of receipt.

**Future Engine Mapping.** Tier 3 Personalization & Identity Layer (`../../architecture/adr/ADR-001-core-platform.md`); Local Dev Agent (mirrors the anonymous/degraded path); Human Approval Authority (disputes); the external legal sign-off (not an engine — a standing open dependency, Section 15).

---

## 5. Responsibilities

**Purpose.** To define what is expected of the people and agents who act on the platform's behalf.

**Rules.**
- Contributors follow trilingual discipline (Core Principle 7) — German, English, and Farsi content are each separately reasoned about, not mechanically translated.
- Staff/editors apply human sign-off before anything publishes, per the canonical rule in Section 3.
- **Agent responsibility default — measurable.** Each of the 8 ECC Agents (`../AGENTS/ecc-agent-system.md`) is responsible for its stated trigger/output once implemented. Until an agent is implemented, its responsibility is held by default by the Human Approval Authority (Section 16), who may explicitly delegate it to a named role — a delegation is only valid if recorded, not assumed.
- A module is not "responsibility-complete" until its MVP Module Blueprint validation checklist has been run (`../BLUEPRINTS/mvp-module-blueprint.md`).

**Required Evidence.** Sign-off records (Section 3); a completed validation-checklist record per module; a delegation record for any responsibility held by someone other than the Human Approval Authority.

**Validation Criteria.** Review & Validation Agent (or, pre-implementation, the Human Approval Authority) confirms checklist completion before a module is marked MVP-complete; no unimplemented agent's responsibility is left with no named holder.

**Future Engine Mapping.** Review & Validation Agent; CLI Agent (`respublica validate-module`, `../ENGINEERING/index.md`); Human Approval Authority (default holder).

---

## 6. Decision Hierarchy

**Purpose.** To state, unambiguously, what wins when documents disagree — precisely, not just by assertion.

**Rules.**
- **The classifying test.** A rule is an **architecture/domain-model matter** — governed by approved ADRs and the Foundation Architecture — if it changes *what is built or how it behaves* (an entity, an API, a module boundary, a technical mechanism). A rule is a **conduct/accountability matter** — governed by this Constitution — if it changes *who is answerable, what evidence is required, or how compliance is checked*. This is the precise Constitution ↔ ADR relationship: each is supreme within its own domain; neither outranks the other across domains.
- **Joint matters.** A rule that is genuinely both (e.g., a new domain entity that also changes who signs off on it) requires a new ADR **and** a Constitutional amendment adopted together — neither alone is sufficient, and neither may be used to unilaterally settle the other's domain.
- **Precedence within Project Brain**, for matters that are not conduct/accountability and not covered by an ADR: `../DECISIONS.md`, `../MODULE_INDEX.md`, and the rest of the index layer carry navigational/summary authority only, never new fact (`../GOVERNANCE/brain-governance-rules.md` rule 3).
- **Misclassification is itself a violation.** Using an ADR to smuggle in a conduct/accountability rule (or using this Constitution to smuggle in an architecture decision) is a Constitutional Compliance violation (Section 15), caught at Review Gate (Section 9) or flagged by the Responsibility Agent.
- No level may silently override another. A perceived conflict is escalated per the ADR Governance Workflow (Section 17) — never resolved by silent edit. While an escalation is open, the **older, already-adopted rule remains in force** (neither document is treated as superseded until the escalation resolves), and the escalation must be decided by the Human Approval Authority (Section 16) within 30 days of being raised, or explicitly extended with a stated reason.

**Required Evidence.** `../DECISIONS.md`'s ADR table; this Constitution's own Amendment Process (Section 13); an escalation log entry for any raised conflict, with its resolution date and outcome.

**Validation Criteria.** Any detected conflict between two Brain-adjacent documents is traceable to an ADR, amendment, or logged-and-resolved escalation — never to an undocumented edit or an open escalation past 30 days without an extension reason.

**Future Engine Mapping.** Responsibility Agent; Review & Validation Agent; Human Approval Authority (escalation decisions); future Foundation/Phase Review Gates.

---

## 7. Transparency Rules

**Purpose.** To make institutional and AI outputs traceable and auditable by design.

**Rules.**
- Every AI-generated answer follows the citation-or-refuse rule — see Section 12 (AI Governance) for the canonical statement; this section does not restate it.
- Every institutional action is append-only logged in `AuditLog`, never edited after the fact (`../../architecture/adr/ADR-002-domain-model.md`).
- No AI output is ever presented as Res Publica's own institutional voice without a named human sign-off (Section 3).
- Staff-only endpoints (e.g., Moderator-Synthesis Assist) are explicitly documented as such, never ambiguously scoped (`../../architecture/adr/ADR-008-ai-layer.md`, Amendment).

**Required Evidence.** `AuditLog` entries; explicit access-scope documentation for staff-only capabilities.

**Validation Criteria.** No `AuditLog` entry is found edited post-creation; every staff-only endpoint has an on-record access-scope statement.

**Future Engine Mapping.** AI Layer (grounded RAG service); Responsibility Agent; Eco Accountability Agent (cost-transparency angle, Section 11).

---

## 8. Trust Model

**Purpose.** To state what makes the platform trustworthy, and to protect that property as new capability is added.

**Rules.**
- Tier 1 (Static Core) is the platform's primary trust anchor — every published word has passed through a reviewed Git commit (Core Principle 5).
- Tier 2 (AI Retrieval) and Tier 3 (Personalization & Identity) are additive; neither may slow, block, or compromise Tier 1's guarantees (`../../architecture/adr/ADR-001-core-platform.md`).
- Offline-first / graceful degradation applies per Core Principle 6 — see `../CONSTITUTION.md` for the canonical statement; this section adds only the accountability angle: every Tier 2/3-dependent module must have its degraded-mode behavior documented and reviewed at that module's validation checklist (Section 9), not left implicit.

**Required Evidence.** Git commit history for Tier 1 content; a documented fallback behavior for every Tier 2/3-dependent module, checked at that module's Review Gate.

**Validation Criteria.** Tier 1 availability is demonstrably independent of Tier 2/3 health; every module's validation-checklist record (Section 5) explicitly confirms a stated degraded-mode behavior exists.

**Future Engine Mapping.** Core Platform (Tier 1); Local Dev Agent (mirrors degradation paths); AI Layer's keyword-search fallback.

---

## 9. Verification Model

**Purpose.** To define the standing mechanism by which compliance — with this Constitution and with the Foundation generally — is actually checked, not merely assumed.

**Rules.**
- The Foundation Review Gate pattern (an initial pass, then a re-validation pass confirming prior findings actually closed — `../../FOUNDATION_REVIEW.md` / `../../FOUNDATION_REVIEW_FINAL.md`) is the standing verification mechanism, reusable at every future major milestone.
- **A Review Gate is only passed when the Human Approval Authority (Section 16) explicitly records approval.** No self-declared pass counts.
- The Review & Validation Agent is the ongoing, per-module counterpart once implemented — running the validation checklists already published per module (`../BLUEPRINTS/mvp-module-blueprint.md`). Until implemented, the Human Approval Authority performs this role directly.
- **Cadence — measurable, milestone-triggered rather than calendar-fixed.** A Review Gate is required, at minimum: once per module before it is marked MVP-complete; once per Phase before transitioning to the next Phase; and once for any Constitutional amendment before it takes effect (Section 13).

**Required Evidence.** A dated review-gate document per major milestone, following the `FOUNDATION_REVIEW*.md` structure, naming its approving Human Approval Authority holder; per-module validation-checklist results.

**Validation Criteria.** No phase/module/constitutional amendment is marked "approved" without a corresponding review-gate document naming its human approver.

**Future Engine Mapping.** Review & Validation Agent; Human Approval Authority; future "Phase N Review Gate" documents (the pattern ADR-011 established for "Phase N Start").

---

## 10. Contribution Principles

**Purpose.** To define how humans and agents may contribute without breaking accountability.

**Rules.**
- Fellowship (the top rung of the Community ladder) is human-gated and non-gamified — never a score or leaderboard (Core Principle 2; `../GLOSSARY.md`).
- Any contribution — human-authored or AI-drafted — requires the named human sign-off defined canonically in Section 3, before it reaches production.
- Agent-assisted contributions (code, config, or content) still require an identifiable accountable human reviewer of record; an agent's output alone never satisfies Section 3's accountability chain.

**Required Evidence.** `FellowNomination` records (`../../architecture/adr/ADR-002-domain-model.md`, `../../architecture/adr/ADR-003-plugin-architecture.md`); sign-off logs (Section 3).

**Validation Criteria.** No contribution reaches production without a traceable, accountable human — verified by sampling `AuditLog` entries per Section 3's audit rule.

**Future Engine Mapping.** Fellowship Engine (`../KNOWLEDGE/operating-system.md` §10); Publishing's sign-off flow; Responsibility Agent.

---

## 11. Environmental Responsibility

**Purpose.** To keep infrastructure and AI-usage choices proportionate to a nonprofit's real resources and real environmental footprint, with an actual measurable proxy rather than an unmeasurable aspiration.

**Rules.**
- The Eco Accountability Agent's mandate — flagging oversized model selection, unnecessary re-embedding of unchanged content, redundant vector-store rebuilds, and hosting disproportionate to actual traffic (`../BLUEPRINTS/foundation-architecture.md` §3; `../../architecture/adr/ADR-004-ecc-agent-system.md`) — is binding guidance, not optional advice.
- Nonprofit resourcing realism (Core Principle 8) governs every infrastructure and model-tier decision; a single EU region is the default assumption, not multi-region replication, absent a stated reason (`../KNOWLEDGE/operating-system.md` §15).
- **Measurable proxy metric.** In the absence of a full carbon/energy-accounting system — deliberately out of scope at current 1–3 engineer resourcing (Core Principle 8), reconsiderable by future amendment if the team grows — environmental proportionality is tracked via a **quarterly Infrastructure & Cost Proportionality Statement** recording: (a) total AI Layer spend against the cost ceiling (`../../architecture/adr/ADR-008-ai-layer.md`); (b) active hosting region count (target: 1); (c) any model-tier change made that quarter, with its stated justification. This is an explicit proxy, not a true environmental metric — recorded as such, not overstated.

**Required Evidence.** The AI Layer's cost/usage ledger (`CostGovernanceLedger`, `../../architecture/adr/ADR-008-ai-layer.md`); a quarterly Infrastructure & Cost Proportionality Statement; an explicit rationale on record for any infrastructure choice that departs from the default proportionate option.

**Validation Criteria.** A Proportionality Statement exists for every quarter since this Constitution's approval; no quarter shows an undocumented region-count increase or model-tier upgrade.

**Future Engine Mapping.** Eco Accountability Agent; AI Layer's cost ceiling and fallback behavior; Human Approval Authority (reviews the quarterly statement).

---

## 12. AI Governance

**Purpose.** To state, in one place, every standing rule governing how AI may be used anywhere on the platform.

**Rules.**
- **Canonical citation-or-refuse rule (this is the single source; Section 7 references it rather than restating it).** AI never originates an institutional position; it retrieves, translates, connects, and drafts only (Core Principle 1). Every AI-generated answer traces to a specific published source, or the system explicitly refuses — never a confident, uncited answer.
- One shared, grounded RAG service is the only AI Layer any module may use — no module reimplements its own AI integration (`../../architecture/adr/ADR-008-ai-layer.md`).
- The Moderator-Synthesis Assist endpoint is staff-only, never public (`../../architecture/adr/ADR-008-ai-layer.md`, Amendment).
- A hard monthly cost ceiling applies, with automatic fallback to keyword search if exceeded (`../../architecture/adr/ADR-008-ai-layer.md`; `../../architecture/adr/ADR-010-offline-first-development.md`).
- **Provider dependency risk.** A documented fallback decision must exist for AI Layer provider unavailability beyond the cost-ceiling keyword-search fallback (e.g., "accept degraded service until restored" is an acceptable documented decision — the requirement is that a decision is on record, not that a specific failover architecture is mandated).
- **Adversarial input handling.** The grounded RAG service's citation-or-refuse behavior is checked against known prompt-injection patterns targeting citation bypass at every AI-consuming module's Review Gate (Section 9) — not assumed safe by design alone.
- **Cross-language equivalence.** Citation accuracy and refusal-rate are evaluated per language (German, English, Farsi) at the same Review Gate cadence as the overall citation-or-refuse check (Section 9) — not only in aggregate, given Core Principle 7's requirement that each language is a separately-reasoned-about experience.

**Required Evidence.** The cost/usage ledger (Section 11); citation logs; access-scope documentation for staff-only AI capabilities; a documented provider-dependency fallback decision; per-language citation/refusal-rate records at each relevant Review Gate.

**Validation Criteria.** No module found calling an AI capability outside the shared AI Layer; no AI output found uncited and unrefused; cost ceiling never silently raised without a recorded decision; per-language citation accuracy shows no undocumented disparity between the three languages.

**Future Engine Mapping.** AI Layer; Eco Accountability Agent; Responsibility Agent; Review & Validation Agent (per-language and adversarial checks).

---

## 13. Amendment Process

**Purpose.** To define how this Constitution itself may change, without undermining its own authority.

**Rules.**
- This Constitution is never rewritten in place. A change is proposed and adopted through the ADR Governance Workflow (Section 17), explicitly naming which section it amends and why.
- An accepted amendment is appended to the relevant section as a clearly labeled `## Amendment (ADR-0XX)` block; the original text is never deleted or silently edited.
- A Constitutional amendment requires a Review Gate (Section 9) and Human Approval Authority sign-off (Section 16) before being considered adopted.
- **Retroactivity.** ADRs adopted before this Constitution's approval — ADR-001 through ADR-011 — are grandfathered as compliant by default. If a future Review Gate finds a specific pre-Constitution ADR genuinely conflicts with a Constitutional rule, that conflict is resolved via a new ADR or amendment per Section 6's escalation rule, never by retroactively invalidating the earlier ADR.

**Required Evidence.** The authorizing ADR; the appended, clearly labeled amendment block; the Review Gate record and Human Approval Authority sign-off.

**Validation Criteria.** No section of this document differs from a prior recorded version without a corresponding ADR, amendment block, and sign-off.

**Future Engine Mapping.** Responsibility Agent; Review & Validation Agent; Human Approval Authority; the ADR Governance Workflow (Section 17).

---

## 14. Versioning Rules

**Purpose.** To keep this Constitution's own history traceable, the same way Project Brain's is.

**Rules.**
- This Constitution starts at v1.0 (DRAFT, currently on Revision Pass v1, pending second review) and follows the same commit-tag discipline already used for Project Brain (`project-brain-v1.0`, `project-brain-v1.1`) and Foundation Architecture (`foundation-v1.0`).
- The v1.0 tag is applied only once this Constitution passes its second independent review with zero critical findings and receives Human Approval Authority sign-off (Sections 9, 16).
- Any amendment after that point increments the version (e.g., `constitution-v1.1`) and is committed and tagged only once approved through Section 9's verification model — never tagged as a live, uncommitted draft.
- A version is immutable once tagged; corrections after tagging are new amendments, not edits to the tagged state.

**Required Evidence.** Git tags following the `constitution-vX.Y` pattern; a commit history showing draft → reviewed → revised → re-reviewed → approved → tagged for each version.

**Validation Criteria.** Every tagged Constitution version corresponds to an explicit approval event (Section 9) with a named Human Approval Authority signer, not an untagged or silently-modified state.

**Future Engine Mapping.** Git tagging discipline (as already used for `project-brain-v1.0/1.1`, `foundation-v1.0`, `phase-0-gate`); Review & Validation Agent; Human Approval Authority.

---

## 15. Constitutional Compliance Rules

**Purpose.** To define the actual mechanism by which "everything else must comply with it" is enforced, not just asserted.

**Rules.**
- Every ADR, module spec, and Phase deliverable must state explicit compliance with this Constitution before being marked approved or complete.
- A detected conflict between a Brain document and this Constitution is escalated per Section 6 — never resolved by silent deviation from either document.
- **Draft-period status — precise, not vague.** Until this Constitution passes its second review with zero critical findings and receives Human Approval Authority sign-off, its Rules are binding as **planning guidance only**: no Phase 0 deliverable may be blocked solely for violating an unapproved Constitution. However, every deliverable produced during this draft period must still be checked against the Constitution once approved, and remediated if found in violation, through the ordinary Amendment/Compliance process (Section 13) — the draft period defers enforcement, it does not exempt anything from it retroactively.
- Two items remain genuinely outside this Constitution's own closing power and are carried forward as open dependencies, not silently treated as resolved: the legal/data-protection sign-off on the `AuditLog`/GDPR-erasure pattern (Section 4), and the original Engineering/Security Audit P0 fixes required before Phase 0's Core Domain Model work begins (`../ROADMAP.md`; `../RESEARCH/engineering-security-audit.md`).

**Required Evidence.** An explicit compliance statement in every future Phase/module review document, following the `FOUNDATION_REVIEW*.md` precedent.

**Validation Criteria.** No Phase is marked complete without an explicit statement of Constitutional compliance; no open dependency (legal sign-off, P0 fixes) is marked closed without its own independent evidence.

**Future Engine Mapping.** Responsibility Agent; Review & Validation Agent; Human Approval Authority; the Foundation/Phase Review Gate pattern (Section 9).

---

## 16. Human Approval Authority

**Purpose.** To name who actually has the authority to approve Review Gates, Constitutional amendments, and act as the standing accountability escalation point — closing the gap the first review identified: every mechanism in this Constitution was a process, with no named human able to say yes.

**Rules.**
- The **Human Approval Authority** is the standing role with authority to: declare a Review Gate passed (Section 9); sign off a Constitutional amendment (Section 13); adopt an ADR (Section 17); decide an escalated conflict (Section 6); and review a confirmed violation's consequences (Section 3).
- Given current 1–3 engineer nonprofit resourcing (Core Principle 8), the Human Approval Authority is, by default, a single named person, expanding to a small named board (2–3 people) only once resourcing allows — mirroring the same incremental-adoption logic ADR-004 already established for the 8 ECC Agents. This is a scaling rule, not a new organizational structure.
- The specific individual(s) holding this role are recorded in a roster kept **outside** this Constitution (so a personnel change doesn't itself require a Constitutional amendment) — this Constitution fixes the role and its authority, not the name.
- The Human Approval Authority may delegate a specific, named responsibility (e.g., standing in for an unimplemented agent, per Section 5) but may not delegate the approval authority itself without a recorded amendment to this section.

**Required Evidence.** A roster record naming the current Human Approval Authority holder(s), referenced (not duplicated) from this section; every approval record (Review Gate, amendment, ADR, escalation decision) names its approving holder explicitly.

**Validation Criteria.** No Review Gate, amendment, ADR adoption, or escalation decision is found without a named Human Approval Authority signer; the roster record is never more than one personnel change out of date.

**Future Engine Mapping.** Responsibility Agent (flags any approval record missing a named approver); Review & Validation Agent.

---

## 17. ADR Governance Workflow

**Purpose.** To define precisely how ADRs are drafted, reviewed, and adopted — since nearly every escalation and amendment path in this Constitution depends on this mechanism, and the first review found it was never actually described.

**Rules.**
1. Any accountable contributor may draft an ADR proposal, numbered sequentially, following the existing `architecture/adr/ADR-0XX-name.md` convention and format (Context, Decision, Alternatives Considered, Consequences, Future Impact — matching ADR-001 through ADR-011).
2. A draft ADR has no authority until the Human Approval Authority (Section 16) records explicit sign-off. An unsigned draft is a proposal, not a decision.
3. An adopted ADR is indexed in `../DECISIONS.md` in the same commit or PR that adopts it — the index and the ADR file set are never allowed to drift out of sync.
4. An adopted ADR is never rewritten in place — only amended, per `../GOVERNANCE/brain-governance-rules.md` rule 1.
5. An ADR that conflicts with an existing ADR must explicitly supersede it by name; it may not silently contradict it.
6. **Grandfathering.** ADR-001 through ADR-011, adopted before this workflow existed, are grandfathered as validly adopted. This workflow governs ADR-012 onward.

**Required Evidence.** The ADR file itself; its `../DECISIONS.md` index entry, added in the same change; the Human Approval Authority's recorded sign-off (a line in the ADR or a companion approval record).

**Validation Criteria.** No ADR from ADR-012 onward is treated as binding without a recorded Human Approval Authority sign-off; `../DECISIONS.md`'s table is never out of sync with `architecture/adr/`'s actual file list, checked at each Review Gate.

**Future Engine Mapping.** Responsibility Agent; Review & Validation Agent; Human Approval Authority; CLI Agent (a future `respublica validate-adr-index` command is a plausible later addition, not built now).

---

## 18. Plugin Governance

**Purpose.** To ensure new module manifests (the Plugin Architecture, `../../architecture/adr/ADR-003-plugin-architecture.md`) are checked for constitutional and accountability compliance before Core Platform accepts them — a gap the first review found entirely unaddressed.

**Rules.**
1. Every new module manifest is reviewed by the Plugin Architect Agent (`../AGENTS/ecc-agent-system.md`) for structural fit against the manifest contract, and by the Responsibility Agent for constitutional compliance, before Core Platform registers it.
2. A manifest that introduces a new domain entity duplicating an existing canonical one (`Person`/`ConsentRecord`/`Payment`/`Organization`/`Notification`/`AuditLog`) is rejected until reconciled — the same discipline ADR-002 and the Foundation Review's own findings already established.
3. Until the Plugin Architect Agent and Responsibility Agent are implemented, the Human Approval Authority (Section 16) performs this review directly.

**Required Evidence.** A recorded manifest-review note (agent output, or Human Approval Authority sign-off) per new module, dated before that module's first merge.

**Validation Criteria.** No module's manifest is present in Core Platform's registered set without a corresponding review record.

**Future Engine Mapping.** Plugin Architect Agent; Responsibility Agent; Human Approval Authority (interim).

---

## 19. Ecosystem Accountability

**Purpose.** To state Res Publica's responsibilities toward the broader civic-tech and nonprofit ecosystem it operates within, beyond its own users — a category the first review found entirely absent.

**Rules.**
1. Third-party and supply-chain dependencies (npm packages, the AI Layer's model provider, the hosting provider) are tracked with a documented reason for each, proportionate to nonprofit resourcing realism (Core Principle 8) — not an exhaustive SBOM requirement, but no undocumented dependency.
2. Any future data-sharing with V3 institutional partners (the Public API module, `../MODULE_INDEX.md`) is read-only and grounded-content-only by default, never raw personal data (`Person`/`ConsentRecord`), consistent with Core Principle 3.
3. Res Publica does not knowingly enable its own grounded content to be mirrored or repackaged by a third party in a way that misattributes authorship or strips citations — consistent with the Trust Model (Section 8) and Transparency Rules (Section 7).

**Required Evidence.** A dependency log entry per new third-party dependency; the Public API's (when built) documented read-only/grounded-only scope statement.

**Validation Criteria.** No undocumented third-party dependency found at a Review Gate; no V3 partner integration found sharing raw personal data.

**Future Engine Mapping.** Eco Accountability Agent (dependency proportionality angle); Plugin Architect Agent (V3 API scope, via Section 18); Responsibility Agent.
