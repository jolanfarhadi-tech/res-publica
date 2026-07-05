# Res Publica — Engineering (index)

*A short index into the CLI Architecture, Plugin Architecture, and Local Development Workflow content. All three are canonically detailed, in full, in `../BLUEPRINTS/foundation-architecture.md`. This file does not restate them — it exists so a reader looking for "engineering-facing" content has one folder to start from, per the two-layer discipline in `../README.md`.*

| Topic | Canonical detail | Decision record |
|---|---|---|
| Plugin Architecture (module manifest contract) | `../BLUEPRINTS/foundation-architecture.md` §4 | `../../architecture/adr/ADR-003-plugin-architecture.md` |
| CLI Architecture (`respublica` command set) | `../BLUEPRINTS/foundation-architecture.md` §5 | `../../architecture/adr/ADR-005-cli-architecture.md` |
| Local Development Workflow (mocked AI Layer, seeded DB, stubbed payments) | `../BLUEPRINTS/foundation-architecture.md` §6 | `../../architecture/adr/ADR-006-local-development-workflow.md` |

Ownership of keeping each of these current as new modules are added belongs to the CLI Agent and Local Dev Agent respectively — see `../AGENTS/ecc-agent-system.md`.
