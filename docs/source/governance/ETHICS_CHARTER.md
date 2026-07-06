# Ethics Charter

```
Type: Governance
Status: Placeholder (Phase 2) — Non-Blocking for MVP, per ADR-023
Version: 1.0 (Annex 14 — Res Publica Governance Framework)
Authorized by: ADR-023
Extends/Reconciles with: docs/source/foundation/03_VALUES.md,
  brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md §7 (Ethics Board),
  docs/source/governance/DATA_POLICY.md, docs/source/governance/DPIA.md,
  docs/source/governance/EARLY_WARNING.md, docs/source/governance/AI_POLICY.md
```

## Purpose

The Ethics Charter establishes the ethical principles, values, responsibilities, and governance commitments that guide every activity within the Res Publica ecosystem. It serves as the normative foundation for decision-making, participation, evidence generation, AI usage, and institutional accountability. The Ethics Charter ensures that the HARM framework is implemented in a manner that protects human dignity, promotes fairness, strengthens public trust, and supports responsible governance.

## Background

Previously a thin "Version 1.0 proposal" built only from already-approved principles. This document is now built from a real, detailed specification ("Annex 14 — Ethics Charter, Res Publica Governance Framework") provided directly, superseding the prior draft's minimal content while preserving its four specific rules (§Framework, below), which remain valid and more granular than anything in the new material.

## Objectives

Protect human dignity; promote responsible governance; ensure accountability; foster transparency; encourage inclusive participation; prevent harm and misuse; support evidence-based decision-making; strengthen institutional trust; promote ethical innovation; establish a common ethical language across all modules.

## Scope

Applies to: all users, Researchers, Moderators, Experts, Review Boards, partner organizations, AI systems, platform administrators, governance bodies, and future platform extensions.

## Core Principles

**Twelve Core Ethical Principles:**
1. **Human Dignity** — every individual is treated with dignity, respect, and equal moral worth.
2. **Accountability** — every decision, action, and recommendation has a clearly identifiable responsible actor.
3. **Transparency** — processes, methodologies, and governance decisions are explainable whenever possible.
4. **Fairness** — the platform avoids unjust discrimination, bias, or arbitrary treatment.
5. **Participation** — affected communities have meaningful opportunities to contribute to decision-making.
6. **Evidence-Based Governance** — important decisions rely on verifiable evidence, not opinion or ideology.
7. **Scientific Integrity** — research activities follow accepted scientific standards; no fabrication, falsification, or selective reporting.
8. **Privacy and Confidentiality** — personal information is handled responsibly and proportionately.
9. **Non-Maleficence** — the platform seeks to minimize foreseeable harm.
10. **Beneficence** — activities contribute to improving societal well-being and governance capacity.
11. **Inclusiveness** — different perspectives, disciplines, and communities are represented whenever appropriate.
12. **Independence** — scientific and governance processes remain independent from undue influence.

These twelve reconcile with, and do not replace, the Constitution's own Core Principles (LOCKED, unchanged) — this Charter applies them specifically to ethical conduct within HARM, not a new principle set superseding the Constitution.

## Definitions

**Exploitation** (retained from the prior draft): using a participant's account for organizational benefit (funding, publicity, political positioning) without their informed, ongoing consent and without benefit flowing back to addressing their harm.

**Terminology reconciliation:** this Charter's "Ethics Review Board" is the same body already named **Ethics Board** in `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 (veto authority over Scientific Review Level 4 approvals) — not a second, competing body. This Charter's "Scientific Review Board" is the same body already named **Scientific Review Committee** elsewhere. Both names are used interchangeably across documents; the canonical terms remain Ethics Board and Scientific Review Committee, per those documents.

## Framework

**Retained specific rules (from the prior draft, unchanged, more granular than the new material):**
1. **Consent is renewed, not assumed.** A participant's consent to share an account does not automatically extend to its use in a Knowledge Product, Harm Codex entry, or public Civic Intelligence Report — each new use requires a fresh, explicit consent check.
2. **Right to withdraw at any stage.** A participant may withdraw their account from further processing at any point before publication, without needing to justify the decision.
3. **Facilitator escalation path.** A Facilitator who identifies a safety concern during a Structured Hearing escalates to a Moderator immediately, pausing the session rather than continuing under the assumption the concern will resolve itself.
4. **Reviewer conflict of interest.** A Reviewer with any personal or institutional relationship to the account's subject matter must recuse themselves — extends the existing Responsibility Evidence rule (Reviewer ≠ Contributor) to conflicts beyond direct authorship.

**Ethical Risk Categories:** privacy risks, manipulation, discrimination, conflicts of interest, abuse of authority, misuse of evidence, AI bias, data misuse, exclusion of stakeholders.

**Ethical Decision Criteria:** human dignity, rights protection, evidence quality, fairness, accountability, long-term societal impact, proportionality, transparency.

**Relationship with Other Frameworks:** this Charter provides ethical guidance for — not governance over — HARM taxonomy (`docs/source/methodology/HARM_CODEX.md`, National Harm Taxonomy per `ADR-021`), AHIP, Structured Hearings, Scientific Review, the Validation Framework (i.e. Scientific Review's own validation engine, `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7), Harm Codex, AI Governance (`AI_POLICY.md`), DPIA (`DPIA.md`), Early Warning (`EARLY_WARNING.md`), Platform Services, and Monitoring & Evaluation. None of these is redefined by this Charter.

## Workflow

Every Knowledge Product is checked against this Charter before publication, alongside its ordinary human sign-off (retained from prior draft). **Ethical Review** (new): major governance activities may undergo ethical review before implementation, evaluating human impact, privacy implications, bias risks, community impact, vulnerable populations, proportionality, and transparency.

**Ethical Responsibilities of participants:** act honestly; respect evidence; avoid manipulation; declare conflicts of interest; protect confidential information; follow platform standards; respect other participants; report ethical concerns.

## Roles

**Reviewer, Moderator, Facilitator** — hold primary responsibility for upholding this Charter at their respective stages (retained). **Ethics Board** (= "Ethics Review Board") — provides ethical oversight, per `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7. **Scientific Review Committee** (= "Scientific Review Board") — oversight of scientific/evidentiary conduct. **Governance Committee, Platform Administration** — named in the new specification as additional oversight bodies; not yet formally defined elsewhere in this repository, and not further specified here (Phase 2).

## Inputs

Any account, Knowledge Product, or public communication involving participant testimony (retained).

## Outputs

A published item confirmed consistent with this Charter, or a rejected/revised one (retained). **Deliverables** (new): ethical guidance, governance consistency, trust building, responsible innovation, ethical review procedures, policy development.

## Governance

This Charter may not be weakened by any other document; amendable only through the organization's formal governance process (`../foundation/04_GOVERNANCE.md`) — retained, unchanged. Oversight may be provided by the Ethics Board, Scientific Review Committee, Governance Committee, or Platform Administration. **Compliance** is monitored through periodic reviews, internal audits, ethics assessments, incident reporting, and corrective actions.

## AI Integration

AI-assisted drafting is subject to the same Charter — an AI-drafted summary of testimony must meet the same non-exploitation and trauma-informed standard as human-drafted material (retained). AI systems themselves are within this Charter's Scope (above) and are separately bounded by `../foundation/05_AI.md` and `AI_POLICY.md`, not redefined here.

## Examples

Reserved — pending approved case material.

## MVP Status & Extension Points

**Current Role:** Placeholder / Governance Extension. **Blocking Status:** NON-BLOCKING. **Implementation Priority:** Phase 2. **Current Requirement:** architecture placeholder only — consistent with `ADR-023`.

**Interfaces:** AI Governance, DPIA, Early Warning, Scientific Review, the Validation Framework, Platform Services, Harm Codex, AHIP, Structured Hearings — each reserves a Charter-compliance extension point; no automated enforcement exists yet.

## Future Responsibilities (Phase 2)

The full Ethics Charter will later include: Ethics Review Protocol; Ethics Committee Procedures; Conflict of Interest Policy; Community Ethics Guidelines; Research Ethics Standards; AI Ethics Rules; Human Rights Impact Assessment; Ethical Appeals Process; Whistleblower Protection; Ethics Training Framework.

## TODO (later expansion)

- [ ] Design the Ethics Review workflow.
- [ ] Define the Ethics Board's/Committee's formal structure and appointment process.
- [ ] Create a Conflict of Interest Policy.
- [ ] Develop a Human Rights impact assessment methodology.
- [ ] Add AI Ethics assessment criteria.
- [ ] Develop ethical audit procedures.
- [ ] Create ethics reporting templates.
- [ ] Integrate with a future Governance Dashboard.

## References

`.claude/skills/web-05-core-pages/SKILL.md` (trauma-informed language rule); `../foundation/03_VALUES.md`; `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` §7 (Ethics Board)

## Related Documents

`../foundation/01_HARM_OPERATING_SYSTEM.md` · `AI_POLICY.md` · `DATA_POLICY.md` · `DPIA.md` · `EARLY_WARNING.md`
