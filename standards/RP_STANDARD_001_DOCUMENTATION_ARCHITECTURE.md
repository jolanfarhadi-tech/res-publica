# RP Standard 001 — Documentation Architecture Standard

```
Type: Standard
Status: Canonical
Version: 1.0.0
Authorized by: ADR-018
Extends/Reconciles with: docs/source/foundation/04_GOVERNANCE.md,
  docs/source/DECISION_LOG.md, brain/GOVERNANCE/CITATION_RULES.md,
  brain/GOVERNANCE/reading-order.md, docs/source/MASTER_SYSTEM.md
```

**Scope:** This Standard governs documentation structure, ownership, and cross-referencing across the entire repository (`brain/`, `docs/source/`, `architecture/adr/`, `standards/`). It governs documentation architecture — it does not define or alter any methodology, product architecture, or governance policy content owned by another document.

**Relationship to `docs/source/MASTER_SYSTEM.md`:** `MASTER_SYSTEM.md` remains the bootstrap document for how contributors and AI agents work in this repository. It is **not deprecated or superseded by this Standard.** This Standard formalizes and gives versioned, structured form to the documentation-governance principles `MASTER_SYSTEM.md` already states informally. Retiring or superseding `MASTER_SYSTEM.md` is explicitly out of scope here and requires its own future ADR.

---

## 1. Purpose
Establishes cross-cutting rules for how documents relate to each other, so that document placement, ownership, versioning, and cross-referencing are governed by one canonical standard instead of ad hoc, per-decision precedent.

## 2. Document Taxonomy
Six document types exist in this repository:
1. **Constitution** — supreme authority; conduct/accountability matters (`brain/00_constitution/00_constitution.md`, `brain/CONSTITUTION.md`; disambiguated by `brain/GOVERNANCE/CITATION_RULES.md`, unchanged).
2. **ADR (Architecture Decision Record)** — a single, sequential, append-only architecture decision (`architecture/adr/ADR-NNN-*.md`).
3. **Standard** (this type) — a cross-cutting, versioned rule set applying across many documents (`standards/RP_STANDARD_NNN_*.md`).
4. **Foundation Architecture** — deep technical/domain capability definition (`brain/FOUNDATION/`, `brain/DOMAIN/` [LOCKED], `brain/APPLICATION/` [LOCKED], `brain/AI/`, `docs/source/foundation/`).
5. **Methodology** — operational definition of a specific process (`docs/source/methodology/`, `docs/source/academy/`).
6. **Governance / Project / Reference** — policy documents (`docs/source/governance/`, `brain/GOVERNANCE/`), initiative documents (`docs/source/projects/`), and index/log/glossary documents (`docs/source/glossary/`, `docs/source/standards/`, `docs/source/*_LOG.md`).

**Correction to prior framing:** `brain/` is not uniformly historical. Only `brain/BLUEPRINTS/`, `brain/00_constitution/CONSTITUTION_REVIEW*.md`, and `brain/PROJECT_BRAIN_STATUS.md` are historical snapshots. `brain/FOUNDATION/`, `brain/DOMAIN/`, `brain/APPLICATION/`, and `brain/AI/` hold live canonical Foundation Architecture, coequal in currency with `docs/source/`.

## 3. Canonical Ownership
Every concept has exactly one canonical owning document (reaffirms `docs/source/MASTER_SYSTEM.md`'s existing principle; does not redefine it). Before creating a new document, the author must search for an existing owner and extend it instead, unless Architecture Layers (§4) prohibit that document type from owning the concept.

## 4. Architecture Layers and Citation Direction
```
Constitution
  ↓ (governs)
Standards (this type)
  ↓ (govern documentation practice for)
ADRs ←→ Foundation Architecture   (mutually reference: an ADR may amend a Foundation doc's content;
  ↓                                a Foundation doc cites the ADR that authorized it)
Methodology / Governance / Academy
  ↓
Projects
```
A lower layer may cite any higher layer. A higher layer never cites a lower layer as its authority.

## 5. Naming Conventions (prospective only — existing names are grandfathered, never renamed)
- ADRs: `ADR-NNN-kebab-case-title.md`, 3-digit, sequential, no gaps.
- Standards: `RP_STANDARD_NNN_KEBAB_OR_SNAKE_TITLE.md`, 3-digit, sequential, own numbering track separate from ADRs, filed under top-level `standards/`.
- Foundation Architecture with an ordering: `NN_UPPER_SNAKE_CASE.md`, 2-digit, sequential *within its own directory* (existing `brain/FOUNDATION/` and `docs/source/foundation/` sequences are independent and both grandfathered).
- All other documents: `UPPER_SNAKE_CASE.md`, no forced numbering.

## 6. Versioning Rules
Every Foundation Architecture document and every Standard carries a `Version:` field (semantic, `MAJOR.MINOR.PATCH`). A MAJOR bump requires a new ADR. A MINOR bump (new section, new cross-reference) does not require a new ADR but must be logged via a one-line "last restructured: ADR-NNN" note at the top of the document — directly addressing the section-renumbering strain observed in `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md` across ADR-014 through ADR-017.

## 7. ADR Relationships
- A **Standard** may be adopted, amended, or superseded only via an ADR.
- An **ADR** may amend a Foundation Architecture document's content; the amendment is appended to the ADR (never rewriting the ADR's original text — reaffirms the Constitution's existing §17 rule, not redefined here) and cross-referenced from the amended document's own text.
- A **Standard** is never itself "amended in place" — a new Standard version requires a new ADR, exactly as any Foundation Architecture MAJOR version does.

## 8. Cross-Reference Requirements
Every document that depends on another canonical document must name it explicitly by path, not by paraphrase. Every document that is depended upon should (not must, for pre-existing documents) maintain a "Related Documents" or equivalent section listing known dependents. This formalizes, not replaces, the "Related Documents" section already present in every `docs/source/` document.

## 9. Traceability Requirements
Every Foundation Architecture document and every Standard must state, near its top, which ADR(s) authorized it and which document(s) it extends or reconciles with — the existing pattern already used in `03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`'s "Canonical status" note, formalized here as a requirement.

## 10. Lifecycle Ownership
Four lifecycle states apply to any document: **Draft** (no ADR yet, may change freely), **Canonical** (adopted by ADR, changes require an ADR or explicit human approval), **LOCKED** (a Canonical document additionally requiring an explicit unlock decision before any ADR may amend it — reaffirms, does not redefine, the existing use of "LOCKED" on `CORE_DOMAIN_MODEL.md`/`APPLICATION_ARCHITECTURE.md`), **Superseded** (retained as a redirect stub per §15, never silently deleted).

## 11. Conformance Rules
A document conforms to this Standard if it: (a) declares its document type per §2, (b) is placed per §4, (c) is named per §5 if newly created, (d) carries the metadata block in §12, (e) satisfies §8/§9 cross-reference and traceability requirements. Conformance is self-declared by the author/agent creating the document and spot-checked during any repository consistency check.

## 12. Required Metadata
Every new Foundation Architecture document, Standard, and ADR must declare, at the top:
```
Type: [Constitution | ADR | Standard | Foundation Architecture | Methodology | Governance | Project | Reference]
Status: [Draft | Canonical | LOCKED | Superseded]
Version: [semantic version, Foundation Architecture/Standards only]
Authorized by: [ADR-NNN, ...]
Extends/Reconciles with: [document paths]
```
**Applied prospectively only, per explicit decision.** Existing documents are not retroactively updated by this Standard. A dedicated repository-wide migration is a separate, future task.

## 13. Repository Navigation Principles
A single navigation document (not created by this Standard — a future, separate task) should eventually index all six document types across `brain/`, `docs/source/`, and `architecture/adr/` in one place, extending rather than replacing `brain/GOVERNANCE/reading-order.md`'s existing `brain/`-only scope.

## 14. Rules for Introducing New Documents
Before creating any new document: (1) search for an existing canonical owner (§3); (2) if found, extend it; (3) if a near-duplicate name is unavoidable (e.g., genuinely new scope adjacent to an existing document), the new document must state its relationship to the existing one in its own text, per the pattern already used for `brain/FOUNDATION/02_CONTRIBUTION_IMPACT_FRAMEWORK.md` vs. its predecessor.

## 15. Rules for Deprecating Documents
A superseded document is never deleted outright. It is replaced with a short redirect stub naming its successor and the ADR that superseded it — the pattern already established for the archived Contribution Framework draft, formalized here as the standard practice rather than an ad hoc choice.

## 16. Relationship Between Constitution, Standards, Methodologies, Architectures, Projects, and ADRs
Reconciles, rather than replaces, two existing partial statements: the **Decision Hierarchy** (`docs/source/foundation/04_GOVERNANCE.md`, unchanged) governs *who has authority* to approve a change. The **precedence rule** (`docs/source/DECISION_LOG.md` item 3, unchanged) governs *which source wins* when reconciling conflicting content during a rebuild. This Standard's Architecture Layers (§4) governs *citation direction* — a third, distinct concern neither prior document addressed. All three are complementary, not overlapping.

## 17. Annex-Specific Declaration Requirement
Does not redesign the Annex Architecture. Any document that touches the Annex lifecycle must declare, near its top:
```
Annex Lifecycle Stage(s): [one or more of: Listening | Responsibility Mapping | Responsibility
  Dashboard | Top Priority Selection | Annex Deepening | Evidence Package | Scientific Review
  (specify Level 1-4) | Approved Annex | Blockchain Annex Block | Civic Contribution Mapping |
  Contribution Ledger | Contribution & Impact Framework]
Governance Rules Implemented: [rule numbers from brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md
  §6 and/or §7]
Depends on ADRs: [ADR-014, ADR-015, ADR-016, ADR-017, as applicable]
Canonical Owner Extended: [the specific document/section this document extends, e.g.
  "docs/source/methodology/RESPONSIBILITY_ANNEXES.md §Workflow"]
```
This declaration is additive metadata only — it does not alter any lifecycle stage, governance rule, role, or diagram already defined in `docs/source/methodology/RESPONSIBILITY_ANNEXES.md` or `brain/FOUNDATION/03_ANNEX_BLOCKCHAIN_CIVIC_CONTRIBUTION_ARCHITECTURE.md`. Applied prospectively only, per §12.

## 18. Decisions Recorded
Per explicit human approval:
1. **Placement:** top-level `standards/` directory, not `docs/source/standards/` — this Standard governs the whole repository, not only the documentation tree.
2. **`MASTER_SYSTEM.md`:** remains the bootstrap document, not deprecated or superseded. Retirement requires its own future ADR.
3. **Metadata (§12, §17):** applied prospectively only. Retroactive application to existing documents is a separate, dedicated future migration task, not performed here.
