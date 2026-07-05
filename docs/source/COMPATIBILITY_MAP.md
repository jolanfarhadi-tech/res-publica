# Compatibility Map

Cross-references between the new canonical tree (`docs/source/`) and the prior Project Brain (`brain/`), so nothing already approved is silently duplicated or contradicted.

| docs/source/ document | brain/ equivalent | Relationship |
|---|---|---|
| `foundation/00_MANIFESTO.md` | `brain/MISSION.md`, `brain/VISION.md` | Condenses both |
| `foundation/01_HARM_OPERATING_SYSTEM.md` | `brain/FOUNDATION/01_HARM_OPERATING_SYSTEM.md` | Supersedes |
| `foundation/02_PHILOSOPHY.md`, `03_VALUES.md` | `brain/CONSTITUTION.md`, `brain/00_constitution/00_constitution.md` | Reuses verbatim |
| `foundation/04_GOVERNANCE.md` | `brain/00_constitution/00_constitution.md` §§6/13/16/17 | Reuses, applies operationally |
| `foundation/05_AI.md` | `brain/AI/AI_GOVERNANCE_HIERARCHY.md` | Reuses |
| `foundation/06_ECOSYSTEM.md` | `brain/MODULE_INDEX.md` | Reuses |
| `methodology/*` (8 files) | `brain/FOUNDATION/01_HARM_OPERATING_SYSTEM.md` (Innovations, HARM engine) | Decomposes into standalone documents |
| `methodology/RESPONSIBILITY_*` | `brain/GOVERNANCE/RESPONSIBILITY_EVIDENCE_MODEL.md` | Reuses, references directly |
| `academy/*` | *(none — new territory, first documentation of RPCS)* | New, from confirmed fragments |
| `governance/AI_POLICY.md` | `brain/AI/AGENT_ACTIVATION_ROADMAP.md`, `AI_GOVERNANCE_HIERARCHY.md` | Reuses |
| `governance/REVIEW_PROCESS.md`, `DECISION_MODEL.md` | `brain/00_constitution/00_constitution.md` §§6/9 | Reuses |
| `governance/ETHICS_CHARTER.md`, `DATA_POLICY.md` | *(none — new territory)* | New/Version 1.0, from confirmed fragments |
| `projects/WEBSITE.md` | repo-root `WEBSITE.md` | Reuses directly, full fidelity |
| `projects/IMPACT.md` | `brain/FOUNDATION/02_CONTRIBUTION_AND_IMPACT_FRAMEWORK.md` | Reuses, references directly |
| `projects/PROJECT_PROPOSAL.md`, `COMMUNITY.md`, `BUSINESS.md`, `BUILD.md` | *(none, or partial fragments only)* | New/Version 1.0 |
| `standards/*`, `glossary/*` | *(none — new territory)* | New, assembled from this build's own terminology |

**No contradiction was found** between any `docs/source/` document and its `brain/` counterpart during this build — every reuse was a direct restatement or decomposition, never a conflicting redefinition. The two discrepancies flagged during the initial build (lifecycle step count, Innovation naming) are now resolved per approved architectural decision — see `DECISION_LOG.md` items 1–2. Future naming conflicts are resolved automatically under the standing precedence rule (`DECISION_LOG.md` item 3) rather than re-flagged.

`brain/` is not deprecated as a repository — it remains available as historical Project Brain material. It is superseded only as the *canonical* documentation location, per your explicit direction this session.
