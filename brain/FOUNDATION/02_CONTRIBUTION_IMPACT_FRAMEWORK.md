# Contribution & Impact Framework

**Status:** Foundation Architecture document. Not software architecture, not implementation, not AI logic, not a database schema, not a scoring system, not gamification.

**Canonical status:** this document is the sole canonical Contribution & Impact Framework, per `architecture/adr/ADR-013-contribution-impact-framework-reconciliation.md`. The prior draft, `brain/FOUNDATION/02_CONTRIBUTION_AND_IMPACT_FRAMEWORK.md`, has been superseded and archived (its file now contains a redirect stub, not independent content). Its genuinely unique content — the Verification method table (§7), a fuller Contribution category list (§5), and the Environmental Impact Platform caveat (§9) — has been merged into this document. No content was lost; see the ADR for the full reconciliation record.

---

## 1. Executive Summary

Modern civic participation frequently fails not because citizens are unwilling to contribute, but because contribution is invisible. A citizen who attends a hearing, shares research, mentors a peer, or documents a systemic pattern generates real civic value — but without a structured way to record that value, it disappears the moment the interaction ends. Institutions cannot act on what they cannot see, and citizens have no durable reason to trust that their effort mattered.

Res Publica addresses this by treating **Contribution** as something to be documented, not assumed; **Impact** as something to be evidenced, not claimed; **Responsibility** as something to be traced to a named party, not left diffuse; and **Verification** as a mandatory step before anything is treated as established fact. This is the same evidentiary discipline that governs the HARM Operating System (`01_HARM_OPERATING_SYSTEM.md`) applied to the organization's own participants: an account of what someone did is treated with the same rigor as an account of what happened to someone.

This framework does not measure popularity, engagement, or attention. It measures whether real civic work occurred, whether it was verified, and whether it produced traceable value — for the contributor, their community, and the institutions Res Publica engages.

## 2. Philosophy

- **Contribution** — a discrete, real act of civic participation (see §5) undertaken by a Person or Organization.
- **Participation** — the broader category of civic involvement; Contribution is participation that has been documented and can be evidenced. Not all participation becomes Contribution; participation that is never documented remains real but institutionally invisible.
- **Responsibility** — the state of being accountable for a specific, named act or claim. Distinct from blame; Responsibility can be positive (having done something) as much as it can be the accountability traced in the HARM Lifecycle.
- **Collective Responsibility** — the aggregate pattern of Responsibility held by a Community or Organization, never reducible to a single individual's standing.
- **Evidence** — a verifiable record supporting a claim of Contribution or Impact. Evidence is the necessary condition for anything in this framework to be treated as established.
- **Trust** — a qualitative property built through consistent, verified, ethical conduct over time (§8). Never a score, never "Reputation."
- **Impact** — the downstream, real-world effect of verified Contribution (§9).
- **Learning** — the organizational capacity to improve practice based on accumulated, verified Contribution and Impact.
- **Transparency** — the discipline of making process, evidence standards, and governance visible, even when underlying case data is not public.
- **Accountability** — the binding of Responsibility to a specific, named party who can be asked to answer for it.

These relate sequentially: Participation is the raw material; Contribution is Participation once documented; Evidence is what makes a Contribution claim credible; Responsibility is Evidence traced to a named party; Trust accumulates from a pattern of verified Responsibility; Impact is what Trust-backed Contribution actually changes; Learning is the organization's use of accumulated Impact; Transparency and Accountability govern the whole chain throughout.

## 3. Core Principles

1. **Participation First** — the framework exists to recognize participation, not to gate it; documentation follows real activity, it does not replace the activity itself.
2. **Evidence Before Recognition** — nothing is recognized as Contribution or Impact until it is evidenced (§7).
3. **Quality Before Quantity** — one well-verified Contribution outweighs any count of undocumented activity; nothing in this framework counts instances.
4. **Trust Through Verification** — Trust is earned only through verified conduct, never asserted or granted directly.
5. **No Popularity Metrics** — visibility, attention, or public approval play no role anywhere in this framework.
6. **No Competition** — participants are never compared, ranked, or set against one another.
7. **No Reputation Economy** — Trust is not tradable, spendable, transferable, or convertible into any other form of value.
8. **Long-Term Civic Value** — the framework optimizes for durable institutional and societal change, not short-term activity.
9. **Human Review** — every Contribution, Impact claim, and Trust-relevant judgment is subject to human verification; no stage is fully automated.
10. **Continuous Learning** — the framework itself is expected to improve as verified Contribution and Impact accumulate, subject to the organization's governance process.

## 4. Contribution Lifecycle

```
Participation
  ↓
Contribution
  ↓
Documentation
  ↓
Responsibility Evidence
  ↓
Verification
  ↓
Trust
  ↓
Knowledge Assets
  ↓
Community Learning
  ↓
Institutional Learning
  ↓
Societal Impact
```

**Reconciliation note:** Trust is positioned here, immediately after Verification and before Knowledge Assets — this merges the prior draft's shorter "Contribution → Responsibility Evidence → Verification → Trust → Impact" sequence with this document's fuller lifecycle. Trust is the qualitative standing that accrues once a Contribution is verified (§8), and it is what allows verified Contribution to be treated as durable Knowledge going forward — Trust is never itself a gate that blocks a single Contribution from being recorded, but it is the accumulated property that makes the downstream stages meaningful.

- **Participation** — a citizen engages in some form of civic activity.
- **Contribution** — the specific, identifiable act within that participation (§5).
- **Documentation** — the act is recorded in enough detail to be evaluated later; documentation is the contributor's or an observer's responsibility, never inferred or assumed by the system.
- **Responsibility Evidence** — the documented Contribution is formalized as a Responsibility Evidence record (§6), extending the same evidentiary model used elsewhere in the organization.
- **Verification** — a named reviewer, distinct from the contributor, confirms the record (§7).
- **Knowledge Assets** — verified Contribution becomes part of the organization's durable knowledge base (`brain/DOMAIN/CORE_DOMAIN_MODEL.md`'s `Knowledge Asset`/`Publication` entities), not a private credential.
- **Community Learning** — the immediate community benefits from the accumulated, verified record.
- **Institutional Learning** — institutions engaged by Res Publica (per the HARM Operating System's own Institutional Learning stage) can draw on verified Contribution as evidence of civic capacity and need.
- **Societal Impact** — the framework's terminal stage: durable, evidenced change attributable to the accumulated chain above.

Each stage requires the previous stage's output; no stage may be skipped, and Impact is never asserted independently of a verified Contribution chain beneath it.

## 5. Contribution Types

Illustrative, not exhaustive — merged with the prior draft's category list, no category duplicated: Dialogue; Research; Community Support; Teaching; Facilitation; Mentoring; Writing; Publishing; Environmental Action; Volunteer Work; Institution Building; Innovation; Knowledge Creation; Events; Governance Participation; Financial Contribution; Technical Contribution; Documentation.

No Contribution type carries an inherent score, weight, or point value. A Contribution's significance is assessed qualitatively at Verification (§7) and, where relevant, at Impact assessment (§9) — never by category alone.

## 6. Responsibility Evidence

This framework reuses `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` in full and does not redefine it. Summary of the reused model, for context only:

- **Purpose** — a Responsibility Evidence record formalizes a specific, verifiable claim of Contribution or of accountability.
- **Evidence Sources** — direct documentation by the contributor, corroboration by a witness or community member, or an institutional record.
- **Verification** — see §7; never self-verified.
- **Quality** — evidence must be specific and checkable, not a general assertion.
- **Storage** — Responsibility Evidence records extend the organization's `AuditLog` entity (`brain/DOMAIN/CORE_DOMAIN_MODEL.md`), inheriting its append-only, auditable structure.
- **Relationship with Knowledge Assets** — verified Responsibility Evidence may be surfaced through `Knowledge Asset`/`Publication` records once it supports a Knowledge Product, per the Contribution Lifecycle (§4).

## 7. Verification

Verification proceeds through layered review, escalating with the significance of the claim:

- **Self Reflection** — the contributor's own account of what was done; a necessary starting point, never sufficient on its own.
- **Peer Review** — a peer familiar with the context confirms plausibility.
- **Expert Review** — a domain expert confirms technical or specialized claims.
- **Human Approval** — a named Reviewer, distinct from the contributor, formally accepts or rejects the record, per the same Reviewer ≠ Contributor discipline established in the Responsibility Evidence Model.
- **Institutional Review** — where a claim concerns or is corroborated by an institution, that institution's confirmation is sought where feasible.
- **AI Assistance** — AI may aggregate evidence, surface related records, or draft a summary for human reviewers.

**AI never verifies Responsibility independently.** No Contribution, Impact claim, or Trust-relevant judgment is accepted on the basis of AI output alone, under any circumstance — this mirrors the standing rule in `brain/AI/AI_GOVERNANCE_HIERARCHY.md` that no AI role has approval authority.

**Verification method profile, merged from the prior draft:**

| Method | Strength | Limitation |
|---|---|---|
| Evidence | Strong when genuinely verifiable | Requires real documentation to exist |
| Witnesses | Adds independent corroboration | Subject to memory/bias limits |
| Peer Review | Leverages community knowledge | Risk of in-group bias |
| Expert Review | High credibility for technical/research claims | Slower, resource-constrained (nonprofit reality) |
| Public Records | Highly reliable where available | Not available for all claim types |
| Organization Confirmation | Authoritative for institutional claims | An Organization may have its own incentives or conflicts |
| Community Confirmation | Reflects lived local knowledge | May not scale to less visible claims |
| Self Declaration | The only universally available method | Weakest form — never alone sufficient for a high-stakes claim, consistent with Reviewer ≠ Contributor (§7 above) |

## 8. Trust

Trust is built through:

- **Transparency** — openness about what was done and how it was verified.
- **Consistency** — a sustained pattern of reliable conduct, not a single instance.
- **Verified Contribution** — Trust accrues only from Contribution that has passed Verification (§7).
- **Ethical Behaviour** — conduct consistent with the organization's Ethics Charter and Constitution.
- **Reliability** — follow-through on commitments made in the course of Contribution.
- **Learning** — visible willingness to incorporate feedback and correction.

**Trust is never defined as Reputation, and never defined as a score.** It has no numeric representation, no public ranking, and no tradable or convertible value anywhere in this framework or any system that implements it.

## 9. Impact

Impact is assessed across six qualitative dimensions:

- **Personal Impact** — effect on the contributor's own civic capacity or understanding.
- **Community Impact** — effect on the immediate community involved.
- **Institutional Impact** — effect on an institution's practice or policy.
- **Knowledge Impact** — contribution to the organization's durable knowledge base.
- **Environmental Impact** — effect on physical or ecological conditions, where applicable. Naming this category does not imply any "Environmental Impact Platform" module is approved — such a module remains Future Proposal (`brain/GOVERNANCE/EXECUTION_ALIGNMENT.md`); this is a conceptual impact category only, carried forward from the prior draft.
- **Policy Impact** — effect on public policy or governance practice.

Impact is evaluated qualitatively and evidence-based — a narrative, verified account of what changed and why it is attributable to specific, verified Contribution. **There is no numerical ranking, score, or comparative index of Impact anywhere in this framework.**

## 10. Recognition

Recognition takes the form of: Recognition (narrative acknowledgment); Certificates (tied to genuine program completion, e.g. RPCS); Fellowships; Invitations; Leadership Opportunities; Community Appreciation; Learning Opportunities.

**Recognition must never become competition.** No form of recognition here is ranked, scored, limited by comparative standing against other participants, or used to create a hierarchy of participants' worth.

## 11. AI Relationship

AI's role in this framework is strictly bounded:

- AI organizes evidence.
- AI summarizes.
- AI detects patterns.
- AI assists reviewers.

**AI never creates Responsibility. AI never validates Contribution. AI never grants Trust. AI never allocates opportunities autonomously.** Every consequential judgment in this framework — verification, trust assessment, impact determination, recognition, opportunity allocation — requires human sign-off, consistent with `brain/AI/AI_GOVERNANCE_HIERARCHY.md` and Constitution §12.

## 12. Governance

This framework introduces no new governance model. It operates entirely under the organization's existing Constitution, Ethics Charter, and Governance Charter (as already established in `brain/00_constitution/00_constitution.md` and related governance documents). Any amendment to this framework follows the same Decision Hierarchy and Human Approval Authority already defined there.

## 13. Explicitly Forbidden

No Reputation Score. No Social Credit. No Points. No Badges. No Leaderboards. No Ranking. No Karma. No Popularity Metrics. No Financial Rewards tied to contribution scores. No Political Profiling.

Any future proposal that would introduce any of the above is, by this document's own terms, inconsistent with the Res Publica ecosystem and requires a constitutional amendment, not a mere feature addition, before it could ever be considered.

## 14. Validation

This document has been checked for compatibility with:

- **Constitution** (`brain/00_constitution/00_constitution.md`) — Zero Gamification (Core Principle 2) and Human Approval Authority (§16) are upheld throughout; no conflict found.
- **HARM Operating System** (`01_HARM_OPERATING_SYSTEM.md`) — the Contribution Lifecycle (§4) is structurally parallel to, and consistent with, the HARM Lifecycle's evidentiary discipline; no conflict found.
- **Core Domain Model** (LOCKED) — this document reuses `AuditLog`, `Knowledge Asset`, `Publication` without redefinition; no new entity is proposed; no conflict found.
- **Application Architecture** (LOCKED) — no service ownership or module boundary is asserted or altered here; no conflict found.
- **Responsibility Evidence Model** — reused in full in §6, not redefined; no conflict found.
- **Master Product Blueprint** — no module addition or reordering is proposed; no conflict found.

**No architectural drift identified.** This document contains no implementation detail, no backend, no frontend, no database, no API, and no code, consistent with its status as a Foundation Architecture document.

---

*Self-review complete. No contradictions with locked or approved documents were found. No new entities, services, or governance mechanisms were introduced. All reused concepts (Constitution principles, HARM Lifecycle, Responsibility Evidence Model, AI Governance Hierarchy, Core Domain Model entities) are cited, not redefined. This document has since been reconciled with the prior draft and is now the sole canonical version — see `architecture/adr/ADR-013-contribution-impact-framework-reconciliation.md`.*
