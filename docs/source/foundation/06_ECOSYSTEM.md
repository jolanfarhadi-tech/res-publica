# Ecosystem

## Purpose
Provides the map of Res Publica's full product ecosystem — every module, how they relate, and their build sequence.

## Background
Reused directly from the organization's approved Master Product Blueprint and Module Index — not redefined here.

## Core Principles
One canonical module list; dependency-ordered build sequence; no module duplicates another's responsibility.

## Definitions
20 modules across 4 tiers: Core (2), MVP (9), V2 (8), V3 (1). See `brain/MODULE_INDEX.md` for the full list with one-line purpose per module.

## Framework
Core (Core Platform, Website & CMS) underlies MVP (Knowledge Graph, AI Layer, Publishing, Community, Membership, Events, Dashboard, CRM, Analytics), which underlies V2 (Fellowship, Academy, Speech Academy, Writing Academy, News Analysis Lab, Research Lab, Store, Admin Portal), which underlies V3 (Public API).

## Workflow
Modules are built in the ratified dependency order: Knowledge Graph → AI Layer → Publishing → Community → Membership → Events → Dashboard → CRM → Analytics (MVP), then V2, then V3.

## Roles
Not applicable at this level — see individual module specs.

## Inputs
Not applicable.

## Outputs
The shared map every other document in `projects/` and `methodology/` situates itself against.

## Governance
Module additions or reordering require an ADR, per `04_GOVERNANCE.md`.

## AI Integration
AI Layer is one module among 20 — see `05_AI.md` for its governance boundary.

## Examples
HARM's methodology documents map onto Community, Publishing, and Research Lab modules specifically.

## References
`brain/MODULE_INDEX.md`; `brain/BLUEPRINTS/master-product-blueprint.md`

## Related Documents
`00_MANIFESTO.md` · `../projects/PROJECT_PROPOSAL.md`
