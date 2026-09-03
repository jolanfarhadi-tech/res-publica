# Ecosystem

## Purpose
Provides the map of Res Publica's full product ecosystem — every module, how they relate, and their build sequence.

## Background
Reused directly from the organization's approved Master Product Blueprint and Module Index — not redefined here.

## Core Principles
One canonical module list; dependency-ordered build sequence; no module duplicates another's responsibility.

## Definitions
20 modules across 4 tiers: Core (2), MVP (9), V2 (8), V3 (1). See `brain/MODULE_INDEX.md` for the full list with one-line purpose per module.

The module inventory is an implementation map. It is not the same thing as the
institutional platform map: one platform can be supported by several modules,
and a shared module can support more than one platform without owning their
domain meaning.

### Institutional platform map

- **Res Publica ecosystem:** the institutional umbrella connecting civic
  participation, research, learning, governance, responsibility and repair.
- **Civic Platform:** the Civic Domain environment for membership, community,
  programmes, events and sustained participation.
- **HARM Platform:** a separate platform inside Res Publica and inside the
  Governance Domain. It is the institutional and digital environment for
  protected listening, structured documentation, evidence review,
  responsibility work, learning and repair.
- **Governance Platform:** the bounded control and accountability environment
  for authority, delegation, exact scope, review, separation of duties and
  audit.
- **Shared Platform Services:** identity and authorization mechanisms,
  persistence, canonical audit, rate limiting and runtime support. These
  services provide infrastructure but own no civic or governance semantics.

The HARM names have three non-interchangeable meanings:

1. **HARM Operating System** — the canonical methodology; it is not software.
2. **HARM Platform** — the bounded institutional and digital execution
   environment that supports use of the methodology.
3. **HARM Research Project** — the research, development and evaluation work
   around HARM; it is a project and not a commercial product.

This classification does not create a separate legal entity, microservice,
database or deployment boundary for HARM. ADR-026's Civic Domain, Governance
Domain and Shared Platform Services remain controlling. A future runtime split
requires a separately accepted ADR.

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
The HARM Platform draws on governed capabilities across the HARM, Evidence,
Hearings, Responsibility, Repair, Scientific Review and Civic Intelligence
areas while shared infrastructure remains outside its domain semantics. The
HARM Operating System supplies the method; the HARM Research Project develops
and evaluates it. Publishing Authority remains a separate Civic Domain
accountability boundary for multilingual publication and does not become part
of the HARM Platform.

## References
`brain/MODULE_INDEX.md`; `brain/BLUEPRINTS/master-product-blueprint.md`;
`architecture/adr/ADR-026-constitutional-domain-architecture.md`;
`01_HARM_OPERATING_SYSTEM.md`

## Related Documents
`00_MANIFESTO.md` · `../projects/PROJECT_PROPOSAL.md`
