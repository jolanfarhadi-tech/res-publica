# EAO Dashboard Specification (Proposal)

```
Status: Proposed — pending ADR-024 acceptance. No metric below has been computed against real
repository data as part of this proposal — each is defined, not yet measured.
```

## Purpose

Defines the 20 required dashboard metrics: what each measures, how it would be derived, and from which existing repository state — without fabricating a current value for any of them.

## Metrics

| # | Metric | Derivation | Data source |
|---|---|---|---|
| 1 | Overall Project Health % | Weighted average of Architecture/Documentation/Governance/Repository Scores (below) | Composite |
| 2 | Architecture Score | % of methodology documents with no open Critical/High flags | `EAO_REPORTING_TEMPLATES.md` #3 |
| 3 | Documentation Score | % of cross-references verified valid, glossary entries in sync | `EAO_REPORTING_TEMPLATES.md` #4 |
| 4 | Governance Score | % of governance documents with no open policy-consistency conflicts | `EAO_REPORTING_TEMPLATES.md` #5 |
| 5 | Repository Score | Working-tree cleanliness, commit hygiene, absence of stale branches | `EAO_REPORTING_TEMPLATES.md` #1 |
| 6 | Knowledge Graph Coverage | % of named concepts with a traceable owning document | Manual (no Neo4j — see `EAO_PLUGIN_MCP_ARCHITECTURE.md`) |
| 7 | Open ADR Count | Count of ADRs with Status: Proposed | `architecture/adr/` directory scan |
| 8 | Missing ADR Count | Count from the ADR Recommendation List | `EAO_REPORTING_TEMPLATES.md` #11 |
| 9 | Critical Flags | Count, Risk/Flag Register | `EAO_REPORTING_TEMPLATES.md` #7 |
| 10 | High Flags | Count, Risk/Flag Register | same |
| 11 | Medium Flags | Count, Risk/Flag Register | same |
| 12 | Low Flags | Count, Risk/Flag Register | same |
| 13 | Broken References | Count, Documentation Health Report | `EAO_REPORTING_TEMPLATES.md` #4 |
| 14 | Duplicate Concepts | Count, Documentation Health Report | same |
| 15 | Orphan Documents | Count of documents with zero inbound cross-references | Manual grep-based scan |
| 16 | Terminology Drift | Count of terms whose meaning has shifted across documents without a reconciliation note (the "Validation Framework" retirement is this session's own worked example) | Manual |
| 17 | Technical Debt | Count of TODO items across methodology documents | Grep-based scan |
| 18 | Governance Debt | Count of "Phase 2 / Non-Blocking Placeholder" governance sections still unresolved | Manual |
| 19 | Documentation Debt | Count of "flagged, not invented" gaps still open (Membership Types taxonomy, Membership exit lifecycle, Contribution Record governance, Evidence Standards Annex) | Manual, cross-referencing this session's own flags |
| 20 | Next Recommended Action | Not a count — restates `EAO_REPORTING_TEMPLATES.md` #15 | Composite |

## Honesty Note

This specification defines *how* each metric would be computed once the EAO is accepted and run against the repository — it does not assert a current score for any of them. Presenting invented numbers here would violate the same no-fabrication principle already binding on plugin/MCP availability (`EAO_PLUGIN_MCP_ARCHITECTURE.md`).

## References

`brain/AI/EAO_REPORTING_TEMPLATES.md`

## Related Documents

`EAO_ARCHITECTURE.md` · `EAO_REPORTING_TEMPLATES.md` · `EAO_PLUGIN_MCP_ARCHITECTURE.md`
