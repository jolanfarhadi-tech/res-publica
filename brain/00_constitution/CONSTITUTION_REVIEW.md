# Res Publica — Accountability Constitution: Review

*Architecture Review Board pass over `00_constitution.md` (DRAFT v1.0), performed before any approval or commit. Scope: the 15-section Accountability Constitution only — no Foundation, Brain, or ADR content was re-litigated. This is a findings-and-recommendations document. No rewrite was performed; the Constitution itself is untouched.*

---

## Executive Summary

The Constitution is well-grounded — every substantive claim traces to an already-approved Brain source, and the five-part per-section structure (Purpose/Rules/Required Evidence/Validation Criteria/Future Engine Mapping) is applied consistently across all 15 sections. That said, this review — checking specifically for duplicated principles, contradictions, vague language, and nine categories of missing governance — found a genuine hierarchy ambiguity, several restated-rather-than-referenced rules, and multiple missing-governance categories that are more than cosmetic: an undefined ADR workflow, no plugin-governance section, no ecosystem-responsibility section, and no named human decision-maker anywhere in a document whose entire purpose is accountability.

**Recommendation: NOT YET APPROVABLE as highest authority — needs a targeted revision pass**, narrowly scoped to the findings below. None require redesigning the Foundation or Project Brain; all are additions or clarifications within the Constitution's own text.

---

## 1. Duplicated Principles

- **Citation-or-refuse is stated as an independent rule in both Section 7 (Transparency Rules) and Section 12 (AI Governance)**, in near-identical wording. One of these should be canonical (recommend Section 12, since it's AI-specific) with Section 7 cross-referencing it rather than restating it.
- **"No institutional action without a named human sign-off" is independently restated in Section 3 (Accountability Model), Section 5 (Responsibilities), and Section 10 (Contribution Principles).** Three sections each state a variant of the same rule rather than one canonical statement (recommend Section 3, since it's the Accountability Model) with the other two cross-referencing it.
- **Section 8 (Trust Model)'s offline-first rule restates Core Principle 6's substance** rather than only citing it, unlike most other sections' cleaner reference-only treatment of Core Principles.

## 2. Contradictions

- **Section 1 vs. Section 6, on hierarchy.** Section 1 states the Constitution, once approved, is unqualified highest authority ("No ADR... may contradict it"). Section 6's Decision Hierarchy then ranks "approved ADRs... architecture and domain-model matters" as tier 2, and quotes the existing rule that an ADR "wins over any newer, disagreeing document" — a rule written before this Constitution existed, with no carve-out excluding the Constitution itself from "any newer, disagreeing document." As written, it is not resolvable which section governs if a future ADR's architectural content and this Constitution's accountability content genuinely conflict. This needs an explicit tie-breaker rule, not just two sections that each sound authoritative in isolation.

## 3. Vague Language

- Section 1 / Section 6: **"conduct and accountability" vs. "architecture and domain-model" is never given a test** for classifying a specific future rule as one or the other — exactly the ambiguity the Section 2 contradiction depends on.
- Section 5: **"the responsibility falls to whichever human role the agent's conceptual spec names"** — no actual role is named; this resolves to nothing checkable today.
- Section 9 / Section 11: **"periodic" review (Review & Validation Agent, Eco Accountability Agent) has no defined cadence** — monthly, per-release, per-quarter are all consistent with the current text.
- Section 15: **"binding as a working draft for Phase 0 planning purposes only"** — doesn't state what obligations actually apply during this interim state vs. after full approval, which matters immediately since Phase 0 is already open (ADR-011).

## 4. Missing Governance Rules

- **No rule on who is authorized to declare a Review Gate passed** (Section 9). The Foundation Review Gate precedent doesn't name a specific approving role either — this Constitution had the opportunity to close that gap and didn't.
- **No conflict-of-interest rule** — nothing prevents a contributor from being their own "named human sign-off" (Section 3), which would make the accountability chain circular in the smallest-team case this project explicitly plans around (1–3 engineers).
- **No retroactivity rule for ADR-011.** ADR-011 (Phase 0 Start) was adopted before this Constitution existed. Section 15 requires "explicit compliance" statements for future Phase deliverables — it's silent on whether already-adopted, pre-Constitution ADRs need a compliance statement backfilled, or are grandfathered.

## 5. Unclear Accountability

- Section 3 defines accountability as *traceability* (an AuditLog entry with a named actor) but never as *consequence* — there's no statement of what happens once a signed-off action is later found wrong or negligent. A traceability-only accountability model can name who acted without ever addressing what "accountable" actually costs that person.
- **No named owner for the Constitution's own upkeep.** Section 13 describes an amendment mechanism but never states who is responsible for noticing when an amendment is needed, or for shepherding one through.

## 6. Missing Escalation Paths

- Section 6 says conflicts are "escalated" but never defines escalate *to whom*, on what timeline, or what the interim state is while an escalation is pending (does the disputed rule freeze? does the newer document win by default until resolved?).
- No path is defined for what happens when the (not-yet-implemented) Review & Validation Agent finds a violation — block-and-remediate, log-and-report, or something else is never specified.

## 7. AI Governance — gaps beyond what Section 12 covers

- No mention of **vendor/provider dependency risk** for the single shared AI Layer (model deprecation, provider outage beyond the stated cost-ceiling fallback, contract/ToS changes).
- No mention of **adversarial input / prompt-injection handling** for the grounded RAG service — citation-or-refuse governs output honesty, not input manipulation.
- No mention of **cross-language fairness/bias auditing** — German, English, and Farsi outputs are architecturally distinct (per Core Principle 7) but nothing checks whether AI quality or citation accuracy is actually equivalent across the three.
- No stated cadence for **measuring** citation-or-refuse's actual accuracy in production, only for structurally requiring it by design.

## 8. Missing Plugin Governance

**This category is essentially absent.** The Plugin Architecture (module manifest contract, ADR-003) and the Plugin Architect Agent (named in `AGENTS/ecc-agent-system.md`) are never mentioned anywhere in the Constitution. There is no rule stating that a new module's manifest must pass any constitutional or accountability check before Core Platform accepts it — a real gap given the platform's entire V2/V3 growth path (11 more modules) runs through exactly this mechanism.

## 9. Missing ADR Workflow

The Constitution leans on "propose a new ADR" as the resolution mechanism in Sections 6 and 13, but **never describes the ADR workflow itself** — who may draft one, what review or quorum is required before it's considered adopted, or how long that takes. Given how central this mechanism is to the entire accountability model (it's the answer to nearly every "what if this needs to change" question in the document), leaving it undefined is a significant gap, not a minor one.

## 10. Missing Ecosystem Responsibility

**Not present anywhere in the document.** No mention of: open-source/licensing posture, data-sharing obligations toward future V3 institutional partners (Public API), third-party/supply-chain dependency risk, or Res Publica's responsibility toward the broader civic-tech ecosystem it operates in (e.g., risk of its own grounded content being scraped/misused externally). Given the org's mission is explicitly civic and public-facing, this is a notable absence.

## 11. Missing Environmental Accountability — depth gap

Section 11 states the Eco Accountability Agent's mandate (cost/model-tier proportionality) but **there is no underlying metric, measurement method, or reporting cadence for "environmental footprint" anywhere in Project Brain** — not in this Constitution, not in `operating-system.md` (whose 15 sections don't include a sustainability/environmental section). The word is invoked without anything checkable behind it. This is a substantive gap, not just wording — Validation Criteria for Section 11 currently can't actually be executed as written.

## 12. Missing Human Oversight

- No human oversight mechanism is defined for **the ECC Agents' own actions**, once implemented — nothing states who reviews an agent's judgment when it's wrong.
- Section 3's "sampled audit" of AuditLog entries never states **who performs the sample, how often, or what sample size/method** counts as sufficient.
- **No human role, board, or named decision-maker is identified anywhere in the document** as the actual approver of Review Gates (Section 9) or Constitutional amendments (Section 13) — every mechanism is described as a process, never as a person or role with the authority to say yes. For a document whose stated purpose is accountability, the absence of any named accountable human at the top of its own governance chain is the single most notable gap in this review.

---

## Recommended Improvements

1. Add an explicit tie-breaker to Section 6 resolving the Section 1/Section 6 hierarchy ambiguity (e.g., "the Constitution governs whenever a rule is about who is accountable and how compliance is checked; an ADR governs whenever a rule is about what is built or how it behaves — a rule that is genuinely both requires a joint ADR + Constitutional amendment, not a unilateral pick").
2. Consolidate the three duplicated rules (citation-or-refuse; sign-off-required) to one canonical section each, with the others converted to cross-references.
3. Add a conflict-of-interest rule to Section 3 or Section 10.
4. Add an explicit ADR-011 retroactivity statement to Section 15 (grandfathered, or requires a backfilled compliance note — a decision, not silence).
5. Define escalation timelines and interim-state defaults in Section 6.
6. Add a Plugin Governance subsection (constitutional/accountability check on new module manifests, mapped to the Plugin Architect Agent) — likely as new Section content rather than folded into an existing one, given its scope.
7. Add an ADR Workflow subsection describing draft/review/adoption steps — this is foundational enough to the rest of the document that it probably deserves to be named explicitly rather than assumed.
8. Add an Ecosystem Responsibility section or subsection (licensing, third-party dependency risk, V3 partner data-sharing posture).
9. Either add a real environmental measurement model to Section 11, or explicitly flag "no metric yet defined" as an open dependency the same way Section 4 and Section 15 already flag the legal sign-off and P0 fixes — consistency in how open gaps are marked matters here.
10. Name an actual human role or body (even a placeholder like "the Foundation's designated Reviewer, until a Fellowship-based board exists") as the approver of Review Gates and amendments in Sections 9 and 13.
11. Define sampling method/cadence for Section 3's and Section 9's audits.

## Open Questions

- Should the Constitution's own approval (Section 9/15) require the same two-pass Review Gate discipline used for Foundation Architecture v1.0, or does a lighter single-pass process suffice given this is a governance document rather than a technical architecture? This review assumes the heavier two-pass model applies, per Section 9's own text, but that's this Constitution's own choice to confirm.
- Is a single human sufficient as "the approver," or does accountability governance specifically warrant a multi-person board given the project's own 1–3 engineer resourcing reality? Section 12's "Environmental Responsibility" and Section 4's "Rights" both already depend on an external legal sign-off that doesn't exist yet — worth deciding whether Constitutional approval should wait on that too, or proceed independently.

## Approval Checklist

- [ ] Section 1/Section 6 hierarchy contradiction resolved
- [ ] Duplicated citation-or-refuse and sign-off rules consolidated to one canonical section each
- [ ] Conflict-of-interest rule added
- [ ] ADR-011 retroactivity/grandfathering explicitly stated
- [ ] Escalation path timelines and interim-state defaults defined
- [ ] Plugin governance addressed
- [ ] ADR workflow described
- [ ] Ecosystem responsibility addressed
- [ ] Environmental accountability given a real metric, or explicitly flagged as an open dependency
- [ ] A named human role/body identified as the approver of Review Gates and amendments
- [ ] Vague cadence language ("periodic," "sampled") given concrete values or explicitly deferred with stated rationale

## Recommendation

**NOT YET APPROVED — needs a targeted revision pass**, narrowly scoped to the items above. This is consistent with, not a departure from, how Foundation Architecture v1.0 was handled: a first review found concrete issues, they were closed in a stabilization pass, and a second review confirmed closure before approval. The same two-pass discipline is recommended here before this Constitution is treated as binding.
