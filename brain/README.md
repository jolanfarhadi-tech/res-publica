# Res Publica — Project Brain

*The Single Source of Truth (SSOT) for the Res Publica project. This directory is the permanent home for every approved Foundation decision, spec, and piece of institutional memory. It was migrated from the approved Foundation Architecture v1.0 (tag `foundation-v1.0`, commit `2c2dedb`) — nothing here is new architecture, nothing here contradicts an approved decision. See `CHANGELOG.md` for the migration record.*

## What this is

Two layers, deliberately kept separate:

- **The index layer** (the 10 files at this top level: `PROJECT_MEMORY.md`, `DECISIONS.md`, `VISION.md`, `MISSION.md`, `CONSTITUTION.md`, `ROADMAP.md`, `MODULE_INDEX.md`, `GLOSSARY.md`, `CHANGELOG.md`, and this `README.md`) — short, navigable, cross-referencing. Read these first.
- **The detail layer** (the seven subfolders below) — the full, original content of every approved artifact, unabridged.

Nothing in the index layer restates what a detail-layer document already says in full — it points there instead. This is deliberate: one canonical location per concept, everywhere else a link.

## Folder structure

| Folder | Contents |
|---|---|
| `/AGENTS` | The ECC Agent System — the specialized reviewer/tooling agent roster dedicated to this project |
| `/KNOWLEDGE` | The Operating System — all 15 platform subsystems in full technical depth |
| `/BLUEPRINTS` | The Master Product Blueprint (20-module hierarchy), the MVP Module Blueprint (9 build-ready modules), the Foundation Architecture (domain model, plugin/CLI architecture, integration map), and the original Implementation Plan (P0–P3 engineering fixes) |
| `/PRODUCTS` | The Product Vision (15-section AI-first civic platform vision) and the Experience Blueprint (the 9-stage emotional visitor journey) |
| `/RESEARCH` | The original Engineering Audit and Security Audit findings that started this whole effort |
| `/GOVERNANCE` | Brain governance rules, the reading order for future agents, and an index into the approved ADRs and Foundation Review documents (which remain at their original, approved locations — see below) |
| `/ENGINEERING` | A short index into the CLI, Plugin Architecture, and Local Development Workflow content (canonically detailed in `/BLUEPRINTS/foundation-architecture.md`) |

## What lives outside `/brain`, on purpose

Two categories of approved artifact were **not** moved, per the Foundation Stabilization rule "do not change approved ADRs" and the general principle of not disturbing already-committed, tagged work:

- `../architecture/adr/ADR-001` through `ADR-010` — the ten Architecture Decision Records, unchanged, at repo root.
- `../FOUNDATION_REVIEW.md` and `../FOUNDATION_REVIEW_FINAL.md` — the two Architecture Review Gate documents, unchanged, at repo root.

`DECISIONS.md` and `GOVERNANCE/foundation-review-index.md` index and link to these rather than duplicating them.

## Where to start

If you are a new contributor, or a future AI agent picking this project up cold, read `GOVERNANCE/reading-order.md` first. It is short and tells you exactly what order to read everything in, and why.
