# EAO Plugin / MCP Architecture (Proposal)

```
Status: Proposed — pending ADR-024 acceptance.
Honesty rule (binding): no plugin/MCP below is claimed as installed unless independently verified.
Verified this session via direct tool-list inspection and ToolSearch — see per-item status below.
```

## Phase 1 — Essential

| Tool | Status | Note |
|---|---|---|
| Git | **Available — native, not an MCP.** | Accessed via Bash running `git` directly, exactly as this entire session has operated. Not a dedicated Git MCP server — none is installed. |
| Filesystem | **Available — native.** | Read/Glob tools; not a dedicated filesystem MCP. |
| Ripgrep | **Available — native.** | The Grep tool is ripgrep-backed; not a dedicated MCP. |
| Markdown Parser | **Not applicable as a tool.** | Markdown is generated directly as text; no parser installation is needed for generation (only potentially for automated validation, which doesn't exist yet). |
| Mermaid | **Not applicable as a tool.** | Mermaid diagrams are generated as text blocks directly; no rendering tool is installed or required for generation (only for visual preview, which is a separate concern). |

**Correction to the original Phase 1 framing:** none of these five is an installed *MCP server* — they are native capabilities already available through existing tools. Calling them "Phase 1 MCPs" would overstate what's actually present. They are accurately described as **Phase 1 Native Capabilities.**

## Phase 2 — Important

| Tool | Status |
|---|---|
| GitHub | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |
| SQLite | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |
| Graphviz | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |

## Phase 3 — Advanced

| Tool | Status |
|---|---|
| Neo4j | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |
| Notion | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |
| Linear or Jira | **REQUIRED / NOT AVAILABLE / FUTURE INSTALLATION** |

Verified via direct search of available and deferred tools this session — no matching MCP server exists for any of these six.

## Unavailable MCPs — Detail

### GitHub
- **What it would be used for:** PR/issue querying, review-comment retrieval, CI-status checks directly from the API rather than via `gh` CLI shell-outs.
- **Why not required for the initial documentation phase:** all EAO documentation and ADR work this session was performed entirely via local git (Bash) and file operations — no PR/issue interaction was needed.
- **What becomes possible after installation:** Release Advisor could check CI status directly; Git Advisor could report on open PRs/issues without shelling out to `gh`.
- **Minimum viable setup today:** `gh` CLI via Bash already covers most of this need (as this session's own instructions already note: "Use the `gh` command via the Bash tool for ALL GitHub-related tasks").

### SQLite
- **What it would be used for:** persistent structured storage for the Risk/Flag Register, Requirements Backlog, and Dashboard metrics across sessions, instead of regenerating them from scratch each time.
- **Why not required for the initial documentation phase:** all 17 reporting templates are Markdown documents, consistent with this repository's all-Markdown documentation convention — no database is needed to produce them.
- **What becomes possible after installation:** historical trend tracking (e.g., "Critical Flags over time"), queryable backlog state instead of re-deriving it from repository scans each run.
- **Minimum viable setup today:** each report is a fresh Markdown file per run, per the Shared Memory Model (`EAO_ARCHITECTURE.md` §4) — the repository's own version history *is* the historical record.

### Graphviz
- **What it would be used for:** rendering the Dependency Map and Knowledge Graph as visual diagrams.
- **Why not required for the initial documentation phase:** Mermaid (native, no installation) already covers flowchart/dependency visualization for every diagram produced this session.
- **What becomes possible after installation:** more complex graph layouts than Mermaid handles well (dense, many-node graphs).
- **Minimum viable setup today:** Mermaid `graph`/`flowchart` blocks, exactly as used throughout `EAO_ARCHITECTURE.md` and `MEMBER_PROFILE.md` this session.

### Neo4j
- **What it would be used for:** a real, queryable knowledge graph backing the Knowledge Graph Advisor and the Knowledge Graph Builder skill.
- **Why not required for the initial documentation phase:** no entity/relationship graph exists yet to populate one — this phase is establishing the documents the graph would eventually be built from.
- **What becomes possible after installation:** actual graph queries (e.g., "which documents depend on `EVIDENCE_MODEL.md`?") instead of manual cross-reference reading.
- **Minimum viable setup today:** a manual Markdown table of document → dependency relationships (as already practiced in `EAO_AGENT_REGISTRY.md`'s Domain Advisor table).

### Notion
- **What it would be used for:** an external, shared project-management surface for Roadmap/Dashboard visibility outside the repository.
- **Why not required for the initial documentation phase:** this repository's documentation-as-source-of-truth convention means Markdown-in-git already serves this function; introducing a second, external system risks a second source of truth.
- **What becomes possible after installation:** non-technical stakeholder-facing dashboards without needing to read Markdown/git.
- **Minimum viable setup today:** the Markdown Dashboard Specification (`EAO_DASHBOARD_SPEC.md`) rendered directly, or via `Artifact` for a shareable web view when needed.

### Linear or Jira
- **What it would be used for:** real task-tracking, sprint boards, and ticket linkage for the Requirements Backlog and Task Breakdown.
- **Why not required for the initial documentation phase:** no implementation work has begun yet (per every methodology document's own "implementation has not started" status this session) — there are no tickets to track yet.
- **What becomes possible after installation:** actual sprint/ticket workflow once implementation begins.
- **Minimum viable setup today:** the Markdown Task Breakdown and Requirements Backlog templates (`EAO_REPORTING_TEMPLATES.md`), tracked in git alongside the architecture they describe.

## Minimum Viable Setup — Summary

**Everything the EAO needs to operate at Phase 1 already exists**, using only native Git (via Bash), filesystem access (Read/Glob), search (Grep/ripgrep), and Markdown/Mermaid generation (native text). No plugin or MCP installation is a blocker to beginning EAO advisory work once ADR-024 is accepted — Phase 2/3 tools are enhancements, not prerequisites.

## References

`brain/AI/EAO_ARCHITECTURE.md`

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_SKILL_LIBRARY.md` · `EAO_AGENT_REGISTRY.md`
