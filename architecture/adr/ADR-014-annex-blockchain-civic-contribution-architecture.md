# ADR-014: Annex, Blockchain Verification & Civic Contribution Architecture

## Status
Accepted

## Context

Prior to this decision, three canonical documents existed independently:

- `docs/source/methodology/STRUCTURED_HEARINGS.md` — defines the Hearing session, output "a documented account, ready for Reflection."
- `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` — defines an Annex as originating from an aggregate Responsibility Dashboard pattern, reviewed by a general Reviewer/Expert.
- `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` — defines Contribution, Responsibility Evidence, Verification, Trust, and Impact in general terms.

No document specified how a single Structured Hearing's evidence becomes a tamper-evident, integrity-verified record, nor required that a civic contribution trace back to specific verified evidence. The user issued a direct architecture decision to close this gap: Annexes are generated from Structured Hearings; after Scientific Review Committee approval, a Blockchain Annex Block is produced; Civic Contributions must be mapped from approved Annexes only, never directly from raw hearings.

Search of `architecture/adr/`, `brain/`, and `docs/source/` confirmed no existing document defines "blockchain," "Scientific Review Committee," "Civic Contribution," or "Contribution Ledger" as concepts — this is new architecture, not a restatement of prior work.

## Decision

Created `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` as the canonical document for this lifecycle:

```
Structured Hearing → Evidence Package → Scientific Review Committee →
Approved Annex → Blockchain Annex Block → Civic Contribution Mapping →
Contribution Ledger → Contribution & Impact Framework → Responsibility Dashboard
```

Key definitional decisions:
- **Annex** is defined as the verified evidence unit, not a document format — unqualified "Annex" means an *approved* Annex.
- **Blockchain Annex Block** is defined strictly as an integrity/timestamp/approval record (content hash, approval attestation, timestamp) — explicitly never the storage location for raw testimony. No blockchain platform, consensus mechanism, or smart contract is chosen; that remains an implementation decision for a future ADR if and when this architecture is built.
- **Civic Contribution** is defined as not a new competing concept, but the existing "Contribution" (`02_CONTRIBUTION_IMPACT_FRAMEWORK.md` §2/§5) in the specific case where its Responsibility Evidence cites an Approved Annex.
- **Contribution Ledger** is defined as not a new storage system, but the aggregate view over Annex-mapped Responsibility Evidence, extending `AuditLog` exactly as the Responsibility Evidence Model already does.

A structural nuance was identified and resolved explicitly rather than silently: `docs/source/foundation/01_HARM_OPERATING_SYSTEM.md`'s Innovation order has the Responsibility Dashboard *produce* Annexes (aggregate pattern path), while this new lifecycle has the Dashboard *consume* Contribution & Impact Framework output at the end (direct hearing path). Both are documented as valid, parallel origination paths for the same Annex concept (see ADR body document §5).

## Governance Rules Adopted

1. No raw hearing can directly generate a Civic Contribution.
2. No Annex becomes authoritative before Scientific Review Committee approval.
3. No Blockchain Annex Block is produced before approval.
4. Each Civic Contribution must reference at least one Approved Annex.
5. Privacy-sensitive testimony must not be stored directly on-chain.

## Documents Updated

- `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` — added a second ("direct") origination path alongside the existing aggregate path; added Scientific Review Committee to Roles; cross-referenced this ADR's architecture document. Existing aggregate-path content unchanged.
- `docs/source/methodology/STRUCTURED_HEARINGS.md` — added Evidence Package as an additional Hearing output, alongside the existing Reflection-bound account output. Existing content unchanged.
- `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` §6 — added one sentence clarifying Civic Contribution's relationship to Contribution; no existing definition altered.

No duplicate canonical document was created for any of the three existing concepts touched by this decision.

## Consequences

- A new Foundation Architecture document and governance rule set now govern Annex-to-Contribution traceability.
- No entity was added to the LOCKED Core Domain Model or Application Architecture; any future concrete data-model representation of Blockchain Annex Block or Contribution Ledger requires its own ADR against those locked documents.
- No blockchain technology, vendor, or implementation detail has been chosen; this ADR is architecture-only, consistent with how prior Foundation documents (e.g., ADR-013) have been scoped.

## Alternatives Considered

- **Allow raw hearings to generate Civic Contributions directly, with later verification.** Rejected — this was explicitly the risk the user's architecture decision was designed to close; it would allow unverified claims to enter the Contribution Ledger.
- **Store full Annex content on-chain for maximum tamper-evidence.** Rejected — directly conflicts with governance rule 5 and the organization's existing Data Policy/Ethics Charter; a hash-and-attestation-only Block achieves the same integrity guarantee without exposing sensitive content.
- **Create a new standalone "Annex" document instead of updating `RESPONSIBILITY_ANNEXES.md`.** Rejected — would have duplicated an existing canonical concept; updating in place with a clearly marked second origination path was the smaller, non-duplicating change.
