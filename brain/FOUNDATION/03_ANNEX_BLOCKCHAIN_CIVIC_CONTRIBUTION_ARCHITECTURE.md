# Annex, Blockchain Verification & Civic Contribution Architecture

**Status:** Foundation Architecture document. Not implementation, not a database schema, not a blockchain platform choice, not smart-contract code. Defines the relationship between existing canonical concepts (Structured Hearings, Responsibility Annexes, the Contribution & Impact Framework) and the new elements introduced by this architecture decision (Scientific Review Committee, Blockchain Annex Block, Civic Contribution, Contribution Ledger).

**Canonical status:** this document is the canonical reference for how a Structured Hearing becomes an approved Annex, how that Annex is integrity-verified, and how it maps to a Civic Contribution. It does not redefine or duplicate `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`, `docs/source/methodology/STRUCTURED_HEARINGS.md`, or `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` — those three documents have each been updated with a cross-reference to this one and a small addition reflecting the new lifecycle stage; none of their existing canonical content was rewritten.

---

## 1. Purpose

This document exists to close a gap: prior documents defined Structured Hearings, Responsibility Annexes, and the Contribution & Impact Framework in isolation, but did not specify how an individual hearing's evidence becomes an integrity-verified, tamper-evident record, nor how downstream civic action is required to trace back to that verified record. This architecture makes that chain explicit and closes it against two specific failure modes: (1) a civic contribution being claimed without any verified evidentiary basis, and (2) sensitive testimony being exposed through an integrity mechanism meant only to prove that a record hasn't been altered.

## 2. Full Lifecycle

**Corrected per ADR-016** (superseding this section's original ordering): the Responsibility Dashboard's primary position is upstream, Innovation 3, before Annex generation — it is the prioritization instrument that identifies which patterns should be deepened into Annexes, not primarily a downstream consumer. See §5 for the full reconciliation.

```mermaid
flowchart TD
    L[Listening / Structured Hearings] --> M[Responsibility Mapping]
    M --> Dash[Responsibility Dashboard]
    Dash --> T[Top Priority Selection]
    T --> AD[Annex Deepening]
    AD --> B[Evidence Package]
    B --> C{Scientific Review Committee}
    C -- Approved --> D[Approved Annex]
    C -- Rejected / Revise --> AD
    D --> E[Blockchain Annex Block]
    E --> F[Civic Contribution Mapping]
    F --> G[Contribution Ledger]
    G --> H[Contribution & Impact Framework]
    H -.secondary, later.-> Dash
```

1. **Listening / Structured Hearings** — the facilitated session (`docs/source/methodology/STRUCTURED_HEARINGS.md`), unchanged.
2. **Responsibility Mapping** — accumulates Responsibility Maps (`docs/source/methodology/RESPONSIBILITY_MAPPING.md`), unchanged.
3. **Responsibility Dashboard** — the prioritization instrument (`docs/source/methodology/RESPONSIBILITY_DASHBOARD.md`); aggregates Maps, applies the Observer Panel and HARM Lens, and runs the Responsibility Priority Matrix.
4. **Top Priority Selection** — the Matrix's output: which patterns warrant deeper documentation.
5. **Annex Deepening** — the research and evidence-gathering activity applied to a Top Priority Selection (the same activity as `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`'s existing aggregate-path Workflow steps 1–2), producing an Evidence Package.
6. **Evidence Package** — the documented output of Annex Deepening, assembled for review (§3).
7. **Scientific Review Committee** — reviews the Evidence Package (§3); approves or returns it for revision. No shortcut exists from Evidence Package directly to Annex.
8. **Approved Annex** — the verified evidence unit (§3), only once approved.
9. **Blockchain Annex Block** — an integrity/timestamp/approval record produced only after approval (§3).
10. **Civic Contribution Mapping** — a downstream civic action, responsibility, or intervention is mapped to one or more Approved Annexes (§3).
11. **Contribution Ledger** — the durable record of mapped Civic Contributions (§3) — not a new storage system, an extension of `AuditLog` exactly as Responsibility Evidence already is.
12. **Contribution & Impact Framework** — consumes the Contribution Ledger (§4).
13. **Responsibility Dashboard (secondary, later)** — once Impact Records exist, the Dashboard's Visualizations & Metrics may incorporate them to refresh its aggregate view (§5). This is a secondary role, not the Dashboard's primary process position.

**Note on the direct Hearing path:** a single Structured Hearing may still produce an Evidence Package directly (bypassing Dashboard-driven Top Priority Selection), per `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`'s "direct path." This remains valid as a secondary origination route; the Dashboard-driven route above is now stated as primary, per the user's architecture correction.

## 3. Definitions

- **Hearing** — shorthand used throughout this document for a Structured Hearing (`docs/source/methodology/STRUCTURED_HEARINGS.md`), not a distinct concept. Referenced here as an object in its own right only because it is the lifecycle's starting point.
- **Evidence Package** — the structured, documented output of a Structured Hearing: the account itself, any supporting material gathered during the Hearing, and the Facilitator's notes. It is *not yet* an Annex — it has not been reviewed.
- **Scientific Review Committee** — a named body of Experts and Reviewers (drawing on the existing Expert and Reviewer roles defined in `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` §Roles) responsible specifically for Annex approval. This is a specific, formal review body, distinct from the general single-Reviewer pattern used elsewhere in the Responsibility Evidence Model — Annex approval requires committee-level review because an Approved Annex triggers an irreversible Blockchain Annex Block.
- **Scientific Approval** — the *record produced by* the Scientific Review Committee's decision (approve or return-for-revision), distinct from the Committee itself (the body) and distinct from the Blockchain Annex Block (the tamper-evidence record produced *from* an approval, not the approval decision itself). A Scientific Approval carries: the reviewing members, the decision, the date, and any conditions attached. It is the direct input to Blockchain Annex Block production.
- **Annex (Approved Annex)** — **the verified evidence unit**, not merely a document or PDF attachment. An Annex is the Evidence Package once the Scientific Review Committee has confirmed its evidentiary basis, quality, and consistency with the organization's trauma-informed and ethical standards. Before approval, it is only an Evidence Package; the term "Annex" (unqualified) always means an *approved* Annex in this architecture.
- **Blockchain Annex Block** — **an integrity, timestamp, and approval record — never the storage of raw sensitive testimony.** It contains: a cryptographic hash of the Approved Annex's content, the Scientific Review Committee's approval signature/attestation, and a timestamp. It proves that a specific, identified Annex was approved at a specific time and has not been altered since. It does not contain the testimony, the participant's identity, or any content capable of re-exposing sensitive material. The underlying Annex content remains governed by the organization's existing Data Policy and Ethics Charter, stored exactly as any other verified evidence record — the blockchain layer adds tamper-evidence, not new storage.
- **Civic Contribution** — a downstream civic action, responsibility, or intervention undertaken in response to one or more Approved Annexes. A Civic Contribution is **not a new concept competing with "Contribution"** as already defined in `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` §2/§5 — it is that same concept, specifically in the case where the underlying Responsibility Evidence cites at least one Approved Annex. Every Civic Contribution is a Contribution; not every Contribution is necessarily a Civic Contribution (a Contribution may instead cite a witness account, public record, or other Evidence Source per that framework's §7 Verification methods).
- **Contribution Ledger** — **not a new storage system.** It is the aggregate, append-only view over Responsibility Evidence records that are Annex-mapped Civic Contributions, extending `AuditLog` exactly as the Responsibility Evidence Model already extends it (`brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` §7). "Ledger" here names the aggregate view, not a distinct database or blockchain.
- **Impact Record** — not a new concept competing with "Impact" as already defined in `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` §9. An Impact Record is the specific, qualitative Impact assessment produced for one Civic Contribution once it is entered in the Contribution Ledger — the discrete instance, in the same relationship as "Civic Contribution" is to "Contribution." It carries the same six qualitative dimensions (Personal, Community, Institutional, Knowledge, Environmental, Policy) defined there; it introduces no new dimension and no numerical score.

## 4. Relationship to the Contribution & Impact Framework

The Contribution & Impact Framework (`brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md`) already defines Contribution, Responsibility Evidence, Verification, Trust, and Impact in general terms. This architecture does not redefine any of them — it specifies one particular, more rigorous path through that framework's existing Contribution Lifecycle (§4 of that document): a Civic Contribution's Responsibility Evidence (§6 of that document) must, in this path, cite at least one Approved Annex as its Evidence Source, and that Annex must itself carry a valid Blockchain Annex Block. The framework's Verification (§7), Trust (§8), and Impact (§9) sections apply unchanged — this architecture only adds a stricter evidentiary requirement for the specific case of Annex-derived contributions.

## 5. Relationship to the Responsibility Dashboard and the HARM Innovation Order

**Corrected by ADR-016.** `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md` sequences the five Innovations as Responsibility Biography Lab → Responsibility Mapping Lab → Responsibility Dashboard → Responsibility Annexes → Civic Intelligence Lab. This was always the correct, primary ordering — the Dashboard's role as prioritization instrument, positioned *before* Annex generation, was never actually in tension with it. An earlier version of this document overstated a conflict by framing the Dashboard primarily as a downstream consumer; that framing is superseded.

**The Dashboard has one primary role and one secondary role, not two parallel equal paths:**
- **Primary (upstream, Innovation 3):** the Dashboard aggregates Responsibility Maps, applies the Observer Panel and HARM Lens, and runs the Responsibility Priority Matrix to produce a Top Priority Selection — this is what feeds Annex Deepening (§2, stages 3–5). This is the ecosystem's default, primary Annex-origination route.
- **Secondary (downstream, later):** once Impact Records exist for prior Civic Contributions, the Dashboard's Visualizations & Metrics may incorporate them to refresh its aggregate view (§2, stage 13). This does not generate new Annexes — it only enriches the Dashboard's own display.

The "direct path" described in `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` (a single Structured Hearing producing an Evidence Package independent of the Dashboard) remains valid as a secondary origination route, not the primary one. See `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md` for the Dashboard's full specification (Observer Panel, HARM Lens, Priority Matrix, Visualizations & Metrics, Zero-Gamification Guardrails).

## 6. Governance Rules

1. **No raw hearing can directly generate a Civic Contribution.** A Structured Hearing's Evidence Package must pass Scientific Review Committee approval before anything derived from it can be mapped as a Civic Contribution.
2. **No Annex becomes authoritative before scientific approval.** An Evidence Package is not an Annex, and carries no evidentiary authority, until the Scientific Review Committee approves it.
3. **No Blockchain Annex Block is produced before approval.** The Block is the *record of* approval, not a step that can precede or substitute for it.
4. **Each Civic Contribution must reference at least one Approved Annex.** No Civic Contribution mapping is valid without at least one specific, identified Annex citation.
5. **Privacy-sensitive testimony must not be stored directly on-chain.** The Blockchain Annex Block contains only a content hash, approval attestation, and timestamp — never the testimony, participant identity, or any re-identifying material. This is a hard constraint, not a configuration choice, and is consistent with the organization's existing Data Policy (`docs/source/governance/DATA_POLICY.md`) and Zero Gamification / no-exploitation principles (`docs/source/governance/ETHICS_CHARTER.md`).
6. **Annexes are immutable after blockchain registration.** Once a Blockchain Annex Block exists for an Annex, that Annex's content is not edited in place. A later correction produces a new, explicitly versioned Annex, fully traceable to the original (citing the prior version and the reason for revision), with its own independent Scientific Approval and its own Blockchain Annex Block. The original Block and Annex version are never deleted or overwritten — this mirrors the Constitution's own "never rewritten in place, only amended and appended" discipline (`brain/00_constitution/00_constitution.md` §17), applied here to Annexes specifically.

These rules operate under, and do not replace, the organization's existing Constitution, Ethics Charter, and Governance Charter — no new governance model is introduced.

## 7. AI Integration

AI may assist in assembling an Evidence Package (e.g., organizing a Facilitator's notes) and in surfacing related Annexes for the Scientific Review Committee's reference. AI does not approve an Annex, does not trigger Blockchain Annex Block production, and does not perform Civic Contribution mapping — all three require human action, consistent with `docs/source/foundation/05_AI.md` and `brain/AI/AI_GOVERNANCE_HIERARCHY.md`.

## 8. Entity Relationship Diagram

```mermaid
erDiagram
    RESPONSIBILITY_MAP ||--o| RESPONSIBILITY_DASHBOARD : aggregates
    RESPONSIBILITY_DASHBOARD ||--o| TOP_PRIORITY_SELECTION : produces
    TOP_PRIORITY_SELECTION ||--o| ANNEX_DEEPENING : initiates
    HEARING ||--o| EVIDENCE_PACKAGE : produces
    ANNEX_DEEPENING ||--o| EVIDENCE_PACKAGE : produces
    EVIDENCE_PACKAGE ||--o| SCIENTIFIC_APPROVAL : "reviewed via"
    SCIENTIFIC_APPROVAL ||--o| ANNEX : authorizes
    ANNEX ||--|| BLOCKCHAIN_ANNEX_BLOCK : "registers as"
    ANNEX ||--o{ ANNEX : "revises (versioned)"
    ANNEX ||--o{ CIVIC_CONTRIBUTION : "cited by (1..n)"
    CIVIC_CONTRIBUTION ||--|| RESPONSIBILITY_EVIDENCE : "recorded as"
    CIVIC_CONTRIBUTION ||--o| CONTRIBUTION_LEDGER : "entered in"
    CONTRIBUTION_LEDGER ||--o| IMPACT_RECORD : "assessed as"
    IMPACT_RECORD }o..o| RESPONSIBILITY_DASHBOARD : "secondarily refreshes"
```

A Civic Contribution citing zero Annexes cannot exist (Governance Rule 2); a Blockchain Annex Block cannot exist without a prior Scientific Approval (Governance Rules 3–4); an Annex correction always produces a new Annex row, never an update to an existing one (Governance Rule 6). The Dashboard-to-Impact-Record relationship is drawn as optional/secondary (dotted), reflecting its role as a later refresh, not the Dashboard's primary function.

## 9. System Integration (Structured Hearings, HARM Operating System, Contribution & Impact Framework, Responsibility Evidence Model, RPCS, Responsibility Dashboard)

This architecture touches six existing systems. None of them is redefined here — each integration point is stated explicitly to avoid the silent, undocumented coupling this session's consistency discipline is designed to prevent.

- **Structured Hearings** (`docs/source/methodology/STRUCTURED_HEARINGS.md`) — unchanged as a process; gains one additional documented output (Evidence Package) alongside its existing Reflection-bound output. See §2 stage 1.
- **HARM Operating System** (`docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`) — this architecture is a second, parallel Annex-origination path alongside the existing aggregate-pattern path through the Responsibility Dashboard Innovation. See §5 for the full reconciliation; the 12-stage HARM Lifecycle itself is unchanged.
- **Contribution & Impact Framework** (`brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md`) — Civic Contribution and Impact Record are, respectively, the Annex-sourced instance of that framework's Contribution and Impact concepts (§4 above, and §3's Impact Record definition). Trust (§8 of that framework) is unaffected — Annex-sourced Contributions accrue Trust through the same mechanism as any other verified Contribution, no differently weighted.
- **Responsibility Evidence Model** (`brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`) — a Civic Contribution's Responsibility Evidence record uses this model's existing verification workflow unchanged (Created → Evidence Submitted → Human Verification → Accepted/Rejected → `AuditLog`); this architecture adds only a constraint on that record's Evidence Source field (must cite ≥1 Approved Annex), not a new workflow.
- **RPCS** (`docs/source/academy/RPCS_PROGRAM.md`) — RPCS tracks supply the trained people who staff this lifecycle: the **Trauma-Informed Facilitation** track trains the Facilitators who run Structured Hearings (stage 1); the **Codex Research** track trains researchers whose expertise supports Scientific Review Committee membership (stage 3); the **AHIP Specialist** track trains the intake moderators upstream of the Hearing itself. RPCS certification does not itself grant Scientific Review Committee membership — that remains a separate, explicit appointment, consistent with RPCS's existing "no abstract credentials" principle (`RPCS_PROGRAM.md` §Core Principles).
- **Responsibility Dashboard** (`docs/source/methodology/RESPONSIBILITY_DASHBOARD.md`) — **primary role:** the prioritization instrument that produces the Top Priority Selection feeding Annex Deepening (§2, stages 3–5). **Secondary role:** later refresh of its aggregate view using validated Impact Records (§2, stage 13). See §5 for the full correction record and `RESPONSIBILITY_DASHBOARD.md` for the complete specification (Observer Panel, HARM Lens, Priority Matrix, Zero-Gamification Guardrails).

## 10. Validation

- **Compatible with Core Domain Model (LOCKED)** — no new entity is added to that locked document; `AuditLog` is reused, not redefined. The Contribution Ledger and Blockchain Annex Block are described here as architecture concepts; any future domain-entity representation of them requires its own ADR against the locked model, not performed here.
- **Compatible with Application Architecture (LOCKED)** — no service ownership is asserted or altered.
- **Compatible with Responsibility Evidence Model** — Civic Contribution's Responsibility Evidence requirement is an additional constraint on Evidence Source (§4 of that model), not a redefinition of it.
- **Compatible with Contribution & Impact Framework** — see §4 above; no redefinition.
- **Compatible with Structured Hearings and Responsibility Annexes methodology documents** — both updated with a cross-reference and one small addition each (Evidence Package as an output; Scientific Review Committee and Blockchain Annex Block as an additional approval/output step), not rewritten.
- **No architectural drift introduced.** This document specifies architecture only — no blockchain platform, consensus mechanism, smart contract, or storage schema is chosen or specified here.

---

*Self-review complete. Reconciled with, not duplicating: `docs/source/methodology/RESPONSIBILITY_ANNEXES.md`, `docs/source/methodology/STRUCTURED_HEARINGS.md`, `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md`, `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md`, `docs/source/academy/RPCS_PROGRAM.md`, `docs/source/methodology/RESPONSIBILITY_DASHBOARD.md`. See `architecture/adr/ADR-014-annex-blockchain-civic-contribution-architecture.md` for the original decision record, `architecture/adr/ADR-015-annex-architecture-extension.md` for the ERD/per-object/immutability extension, and `architecture/adr/ADR-016-responsibility-dashboard-specification.md` for the Dashboard-primacy correction and full Dashboard specification.*
