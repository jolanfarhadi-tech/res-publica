# Res Publica — ECC Agent System (index)

*An index into the ECC Agent System, not a restatement of it. The eight agents are specified in full — trigger, input, output, risks — in `../BLUEPRINTS/foundation-architecture.md` §3. The decision to adopt them, the alternatives rejected, and the incremental-adoption rationale are in `../../architecture/adr/ADR-004-ecc-agent-system.md`. This file exists so `MODULE_INDEX.md`, `GLOSSARY.md`, and `CONSTITUTION.md` have a stable `AGENTS/` link target, per the two-layer discipline described in `../README.md`.*

## The roster

| Agent | Primary trigger | Full spec |
|---|---|---|
| Responsibility Agent | Any new feature/PR | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Eco Accountability Agent | Infrastructure or model-selection change | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Impact Agent | Any feature reaching "done" | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Plugin Architect Agent | A new module being added | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Design System Agent | Any new UI component | `../BLUEPRINTS/foundation-architecture.md` §3 |
| CLI Agent | A module needing new local tooling | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Local Dev Agent | Any change to AI Layer, Tier 3, or seed data | `../BLUEPRINTS/foundation-architecture.md` §3 |
| Review & Validation Agent | A module claiming MVP-complete status | `../BLUEPRINTS/foundation-architecture.md` §3 |

All eight are, as of Foundation Architecture v1.0, **conceptual roster only** — no `.claude/agents/*.md` files have been implemented for any of them. See ADR-004's Decision and "What must NOT be built now" (foundation-architecture.md §3) before treating any of these as available tooling.

## Already-available agents this roster does not duplicate

General code review, security review, performance review, architecture review, and TypeScript/React-specific review map onto agents already available in this environment (`ecc:code-reviewer`, `ecc:security-reviewer`, `ecc:performance-optimizer`, `ecc:architect`, `ecc:typescript-reviewer`, `ecc:react-reviewer`) and should be invoked as-is — see `../BLUEPRINTS/foundation-architecture.md` §3, "Existing pattern, mapped to what's already available."
