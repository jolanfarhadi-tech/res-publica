# Res Publica — Reading Order

*For a new contributor, or a future AI agent picking this project up cold. Read in this order; stop once you have enough context for the task in front of you — you do not need the whole Brain to fix one module's spec.*

1. **`../README.md`** — the map of this directory. Two minutes.
2. **`../PROJECT_MEMORY.md`** — the narrative: what Res Publica is, what it's becoming, how the work got here. Read this in full before anything else; everything below assumes it.
3. **`../CONSTITUTION.md`** — the standing principles every module, feature, and future decision must respect. Non-negotiable, not aspirational.
4. **`../MISSION.md`** and **`../VISION.md`** — the condensed "why" and "where this goes." Two minutes each.
5. **`../MODULE_INDEX.md`** and **`../ROADMAP.md`** — the condensed "what" and "in what order."
6. **`../DECISIONS.md`** — the ADR index, so you know which architectural choices are already closed and shouldn't be relitigated.
7. **`../GLOSSARY.md`** — canonical term definitions, referenced as needed rather than read start-to-end.
8. **`../CHANGELOG.md`** — how the work got here, chronologically, if you want the full history rather than the narrative summary.

Only after the above should you go into the detail layer (`../AGENTS/`, `../KNOWLEDGE/`, `../BLUEPRINTS/`, `../PRODUCTS/`, `../RESEARCH/`, `../ENGINEERING/`) — and only the specific document your task actually requires. The index layer exists precisely so you don't have to read the full detail layer to get oriented.

If you are about to propose something that sounds like new architecture, a new feature, or a redesign of an already-approved decision: stop and check `../DECISIONS.md` and `brain-governance-rules.md` first. Most of what looks like a gap is already a closed, approved decision with a stated rationale — re-read it before assuming it's missing.
