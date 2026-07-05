# Res Publica — Citation Rules

**Purpose: prevent ambiguity when citing Constitution documents.** Two documents in this project are both colloquially "the Constitution," with independent, overlapping section/principle numbers. A bare citation like "Constitution §3" or "Constitution 3" is genuinely ambiguous without a stated convention — this file defines that convention. It does not rename, modify, or restructure either document.

---

## The two approved constitutional documents

| Document | Numbering | Scope |
|---|---|---|
| `../CONSTITUTION.md` | 8 numbered **Core Principles** | The platform's standing civic/product principles (AI-never-originates, zero gamification, opt-in personalization, civic-effect measurement, Static Core primacy, offline-first, trilingual discipline, nonprofit resourcing realism) |
| `../00_constitution/00_constitution.md` | 19 numbered **sections** | The Accountability Constitution — governance/process (Purpose, Core Principles, Accountability Model, Rights, Responsibilities, Decision Hierarchy, Transparency, Trust Model, Verification Model, Contribution Principles, Environmental Responsibility, AI Governance, Amendment Process, Versioning, Constitutional Compliance, Human Approval Authority, ADR Governance Workflow, Plugin Governance, Ecosystem Accountability) |

Note that `00_constitution/00_constitution.md` §2 ("Core Principles") itself incorporates the 8 principles from `CONSTITUTION.md` by reference — the numbering systems overlap in subject at that one point but are still two distinct documents with two distinct numbering schemes.

## Canonical citation convention

- **"Core Principle N"** → always refers to `CONSTITUTION.md`'s 8 numbered principles.
  - Example: *Core Principle 2* = zero gamification, anywhere.
- **"Constitution §N"** → always refers to `00_constitution/00_constitution.md`'s 19 numbered sections.
  - Example: *Constitution §3* = Accountability Model.
- **Never write a bare "Constitution 3" or "the Constitution's third rule"** without one of the two prefixes above — it does not disambiguate which document or numbering scheme is meant.
- When both are relevant in the same sentence, cite both explicitly rather than relying on proximity: e.g., "per Core Principle 2 and Constitution §18" — not "per principle 2 and §18."

## If additional approved constitutional documents are created later

Any future constitutional document (e.g., a Constitutional amendment producing a new numbered section, or an entirely new charter) must be added to the table above with its own distinct citation prefix before it is used in any other Brain document — never reusing "§N" or "Core Principle N" for a third numbering scheme. The prefix itself should name the document, not just a number (e.g., "Ethics Charter §N," should one ever be approved), so the two-prefix ambiguity this file exists to prevent cannot recur by omission.

## Scope

This file defines a citation convention only. It does not rename `CONSTITUTION.md` or `00_constitution/00_constitution.md`, does not change either document's content or numbering, and does not introduce a new governance layer — it documents how to refer to what already exists, unambiguously.
