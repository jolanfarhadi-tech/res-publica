#!/usr/bin/env node
// Executable Project Health Pipeline.
// See brain/AI/EAO_EXECUTION_PIPELINES.md #6 and brain/AI/EAO_REPORTING_TEMPLATES.md #2.
//
// Foundation-first note: this pipeline introduces no new detection logic and
// no second source of truth. It composes the results of the four pipelines
// that already exist (Repository Health, Broken Link Detection, Terminology
// Drift, Dependency Analysis) by importing their compute*() functions
// directly - nothing here re-scans the repository independently, except one
// small inline TODO count that reuses the existing shared forEachLine/
// findMarkdownFiles utilities rather than adding a fifth pipeline file for it.
//
// Read-only.

import path from "node:path";
import { pathToFileURL } from "node:url";
import { findMarkdownFiles, forEachLine } from "./lib/markdown.mjs";
import { CATEGORIES, riskDomainForCategory } from "./lib/registry.mjs";
import { computeRepositoryHealth } from "./repository-health.mjs";
import { computeBrokenLinks } from "./broken-links.mjs";
import { computeTerminologyDrift } from "./terminology-drift.mjs";
import { computeDependencyGraph } from "./dependency-map.mjs";

// Per brain/AI/EAO_SCHEMA_VERSIONING_SPEC.md: schemaVersion 1 is the shape
// already shipped in Generation 1 (the 12-field Canonical Action Model).
// No schema change is made here - this constant only labels the existing shape.
const SCHEMA_VERSION = 1;

function findTodos(root = process.cwd()) {
  // Reuses the existing shared file-walk/line-scan utilities (lib/markdown.mjs)
  // rather than implementing a new scan - a minimal composition, not a new pipeline.
  // Returns actual occurrences (not just a count) so this finding can carry
  // real evidence in the canonical action model, same as every other finding.
  const todos = [];
  for (const file of findMarkdownFiles(root)) {
    forEachLine(file, (lineText, lineNum) => {
      if (/\bTODO\b/.test(lineText)) {
        todos.push({ file: path.relative(root, file), line: lineNum, text: lineText.trim().slice(0, 140) });
      }
    });
  }
  return todos;
}

export function computeProjectHealth(root = process.cwd()) {
  const repo = computeRepositoryHealth();
  const links = computeBrokenLinks(root);
  const terminology = computeTerminologyDrift(root);
  const deps = computeDependencyGraph(root);
  const todos = findTodos(root);

  const genuineBrokenRefs = deps.brokenReferences.filter((b) => !b.note);
  const scopeArtifactRefs = deps.brokenReferences.filter((b) => b.note);

  // Release Readiness signal: derived entirely from deps.mvpStatusFindings
  // (extracted at the source in dependency-map.mjs, not re-scanned here).
  // "Blocking" classified by keyword, matching the actual convention already
  // used across MVP Status sections ("MVP CRITICAL" vs "NON-BLOCKING" /
  // "Non-blocking ...") - disclosed heuristic, not free-form guessing.
  const mvpBlocking = deps.mvpStatusFindings.filter((f) => /critical/i.test(f.blockingStatus));
  const mvpNonBlocking = deps.mvpStatusFindings.filter((f) => !/critical/i.test(f.blockingStatus));

  const totalCycles =
    deps.cyclesByKind.documentation.length +
    deps.cyclesByKind.execution.length +
    deps.cyclesByKind.architectural.length;

  // Governance Health: a disclosed proxy, not a full governance audit (no
  // dedicated governance-review pipeline exists yet - this derives only from
  // the Dependency Analysis graph already computed above: do the known
  // governance documents appear connected and free of broken references?)
  const GOVERNANCE_DOCS = ["ETHICS_CHARTER.md", "DPIA.md", "AI_POLICY.md", "DATA_POLICY.md"];
  const governanceDocsPresent = GOVERNANCE_DOCS.filter((d) => deps.nodes.includes(d));
  const governanceOrphans = deps.orphans.filter((o) => GOVERNANCE_DOCS.includes(o));
  const governanceBrokenRefs = genuineBrokenRefs.filter((b) => GOVERNANCE_DOCS.some((d) => b.file.endsWith(d)));

  // Critical Issues: real, actionable problems only (excludes disclosed
  // scope-artifacts and normal/expected documentation cross-reference cycles).
  const criticalIssues = [];
  if (terminology.liveDrift.length) {
    criticalIssues.push(`${terminology.liveDrift.length} live terminology drift occurrence(s) of a retired term`);
  }
  if (genuineBrokenRefs.length) {
    criticalIssues.push(`${genuineBrokenRefs.length} genuine broken reference(s) in Related Documents/References sections`);
  }
  if (links.broken.length) {
    criticalIssues.push(`${links.broken.length} broken Markdown link(s)`);
  }
  if (deps.unreferencedCoreDocuments.length) {
    criticalIssues.push(`${deps.unreferencedCoreDocuments.length} unreferenced core document(s)`);
  }
  if (governanceOrphans.length || governanceBrokenRefs.length) {
    criticalIssues.push(`${governanceOrphans.length + governanceBrokenRefs.length} governance document issue(s) (orphaned or broken references)`);
  }

  // Warnings: real but lower-severity or disclosed/explained findings.
  const warnings = [];
  if (deps.headingDrift.length) warnings.push(`${deps.headingDrift.length} document(s) with heading-depth drift ("References")`);
  if (deps.plainFormattingDrift.length) warnings.push(`${deps.plainFormattingDrift.length} document/section(s) using non-backtick filename formatting`);
  if (scopeArtifactRefs.length) warnings.push(`${scopeArtifactRefs.length} broken-reference finding(s) that are scan-scope artifacts, not real gaps (see Dependency Analysis detail)`);
  if (deps.cyclesByKind.architectural.length) warnings.push(`${deps.cyclesByKind.architectural.length} architectural (ADR-to-ADR) cycle(s) - not necessarily wrong, warrants review`);
  if (terminology.disclosedHistorical.length) warnings.push(`${terminology.disclosedHistorical.length} disclosed historical terminology mention(s) (not flagged as drift)`);

  const overallStatus = criticalIssues.length > 0 ? "Needs Attention" : warnings.length > 0 ? "Healthy, minor items" : "Healthy";

  return {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    overallStatus,
    repositoryHealth: {
      branch: repo.branch,
      aheadBehind: repo.aheadBehind,
      stagedCount: repo.staged.length,
      unstagedCount: repo.unstaged.length,
      untrackedCount: repo.untracked.length,
    },
    architectureHealth: {
      architecturalEdges: deps.edges.filter((e) => e.kind === "architectural").length,
      architecturalCycles: deps.cyclesByKind.architectural.length,
      unreferencedCoreDocuments: deps.unreferencedCoreDocuments,
    },
    documentationHealth: {
      filesScanned: deps.mdFilesScanned,
      brokenLinks: links.broken.length,
      headingDrift: deps.headingDrift.length,
      plainFormattingDrift: deps.plainFormattingDrift.length,
      documentationCoveragePercent: deps.mdFilesScanned
        ? Math.round((deps.optedInCount / deps.mdFilesScanned) * 100)
        : 0,
    },
    dependencyHealth: {
      nodes: deps.nodes.length,
      edges: deps.edges.length,
      orphans: deps.orphans.length,
      genuineBrokenReferences: genuineBrokenRefs.length,
      scopeArtifactBrokenReferences: scopeArtifactRefs.length,
      totalCycles,
    },
    governanceHealth: {
      note: "Proxy derived from the Dependency Analysis graph only - not a full governance audit (no dedicated governance-review pipeline exists yet).",
      governanceDocsTracked: GOVERNANCE_DOCS,
      governanceDocsPresent,
      governanceOrphans,
      governanceBrokenRefs,
    },
    // Deliberately NOT folded into criticalIssues/warnings above: a document
    // being marked "MVP CRITICAL, not yet implemented" is expected, disclosed
    // pre-implementation state at this project stage, not a defect - the same
    // distinction this project has applied elsewhere (temporary ownership vs
    // genuine inconsistency). It IS a genuine input for Release Readiness
    // specifically, which has its own Go/No-Go criteria, so it's exposed here
    // as its own health dimension and (below) as a canonical action for
    // Roadmap/Risk Analysis to compose - without inflating Project Health's
    // own general-purpose status framing.
    releaseReadinessHealth: {
      totalMvpStatusEntries: deps.mvpStatusFindings.length,
      blockingCount: mvpBlocking.length,
      nonBlockingCount: mvpNonBlocking.length,
      blocking: mvpBlocking,
      nonBlocking: mvpNonBlocking,
    },
    criticalIssues,
    warnings,
    technicalDebtIndicators: {
      todoCount: todos.length,
      note: "Count of lines containing the word TODO across all scanned Markdown files.",
    },
    documentationCoverage: {
      filesWithReferencesConvention: deps.optedInCount,
      totalFiles: deps.mdFilesScanned,
    },
    brokenReferencesSummary: { genuine: genuineBrokenRefs, scopeArtifacts: scopeArtifactRefs },
    circularDependencySummary: deps.cyclesByKind,
    orphanDocumentsSummary: deps.orphans,
    unreferencedCoreDocuments: deps.unreferencedCoreDocuments,
    priorityActions: buildPriorityActions({ terminology, genuineBrokenRefs, links, deps, governanceOrphans, governanceBrokenRefs, todos, mvpBlocking }),
  };
}

function buildPriorityActions({ terminology, genuineBrokenRefs, links, deps, governanceOrphans, governanceBrokenRefs, todos, mvpBlocking }) {
  // severity/governanceSensitive are stated explicitly here (matching exactly
  // which criticalIssues/warnings entry each action corresponds to above)
  // rather than left for a downstream consumer (e.g. the Roadmap pipeline)
  // to re-infer from the priority number or from string-matching - avoids a
  // fragile implicit coupling between this ordering and severity meaning.
  // Canonical action model: every field below is generated once, here, and
  // propagated downstream (Roadmap, and future Risk Analysis/ADR Review/
  // Dashboard pipelines) - none of them re-derive or re-infer this metadata,
  // keeping Project Health the single source of truth for it.
  //   - category / sourcePipeline: which pipeline and finding-type this is.
  //   - affectsArchitecture: true only for findings that touch the
  //     dependency graph's structural/architectural layer (unreferenced core
  //     docs, governance connectivity), not pure documentation formatting.
  //   - autoFixable: true only where a deterministic fix is actually knowable
  //     from the finding itself (terminology drift already carries its exact
  //     replacement text; formatting/heading drift is mechanical reformatting).
  //     False for anything requiring human judgment about the correct target
  //     (broken references, governance connectivity, technical debt triage).
  //   - humanApprovalRequired: always true - no EAO role modifies a file
  //     without explicit human approval (EAO_PERMISSION_MODEL.md), no exceptions.
  //   - evidence: the actual originating finding records (not just a count),
  //     so downstream consumers have full traceability without re-deriving it.
  //   - riskDomain: a coarse grouping bucket for Risk Analysis and future
  //     dashboards (Governance/Documentation/Architecture/Technical Debt/
  //     Terminology). Disclosed: no current finding maps to a "Dependency"
  //     bucket distinct from Documentation/Architecture - not fabricated to
  //     fill out an example list.
  // Task 4 (Phase A) - evidence is now always an array. The two categories
  // that previously used an object ({key: array, key: array}) are flattened
  // here, with each record tagged by its originating subcategory so no
  // information is lost - only the shape is normalized.
  const governanceEvidence = [
    ...governanceOrphans.map((o) => ({ kind: "orphan", document: o })),
    ...governanceBrokenRefs.map((b) => ({ kind: "brokenReference", ...b })),
  ];
  const formattingDriftEvidence = [
    ...deps.headingDrift.map((h) => ({ kind: "headingDrift", ...h })),
    ...deps.plainFormattingDrift.map((p) => ({ kind: "plainFormattingDrift", ...p })),
  ];

  // Known Issue #1 (Canonical Action Model Spec) - count must be derived from
  // evidence, never hand-authored in parallel, so the two can never silently
  // desynchronize. pushAction is the single place count is computed.
  const actions = [];
  function pushAction(action) {
    actions.push({ ...action, count: action.evidence.length });
  }
  if (terminology.liveDrift.length) {
    pushAction({
      priority: 1,
      action: "Resolve live terminology drift",
      severity: "critical",
      category: CATEGORIES.TERMINOLOGY_DRIFT,
      riskDomain: riskDomainForCategory(CATEGORIES.TERMINOLOGY_DRIFT),
      sourcePipeline: "terminology-drift",
      affectsArchitecture: false,
      governanceSensitive: false,
      autoFixable: true,
      humanApprovalRequired: true,
      evidence: terminology.liveDrift,
    });
  }
  if (governanceEvidence.length) {
    pushAction({
      priority: 2,
      action: "Investigate governance document connectivity issues",
      severity: "critical",
      category: CATEGORIES.GOVERNANCE_CONNECTIVITY,
      riskDomain: riskDomainForCategory(CATEGORIES.GOVERNANCE_CONNECTIVITY),
      sourcePipeline: "dependency-analysis",
      affectsArchitecture: true,
      governanceSensitive: true,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: governanceEvidence,
    });
  }
  if (genuineBrokenRefs.length) {
    pushAction({
      priority: 3,
      action: "Fix genuine broken References/Related Documents entries",
      severity: "critical",
      category: CATEGORIES.BROKEN_REFERENCE,
      riskDomain: riskDomainForCategory(CATEGORIES.BROKEN_REFERENCE),
      sourcePipeline: "dependency-analysis",
      affectsArchitecture: false,
      governanceSensitive: false,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: genuineBrokenRefs,
    });
  }
  if (links.broken.length) {
    pushAction({
      priority: 4,
      action: "Fix broken Markdown links",
      severity: "critical",
      category: CATEGORIES.BROKEN_LINK,
      riskDomain: riskDomainForCategory(CATEGORIES.BROKEN_LINK),
      sourcePipeline: "broken-link-detection",
      affectsArchitecture: false,
      governanceSensitive: false,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: links.broken,
    });
  }
  if (deps.unreferencedCoreDocuments.length) {
    pushAction({
      priority: 5,
      action: "Add inbound references to unreferenced core documents",
      severity: "critical",
      category: CATEGORIES.UNREFERENCED_CORE_DOCUMENT,
      riskDomain: riskDomainForCategory(CATEGORIES.UNREFERENCED_CORE_DOCUMENT),
      sourcePipeline: "dependency-analysis",
      affectsArchitecture: true,
      governanceSensitive: false,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: deps.unreferencedCoreDocuments,
    });
  }
  if (formattingDriftEvidence.length) {
    pushAction({
      priority: 6,
      action: "Standardize heading depth and backtick filename formatting",
      severity: "warning",
      category: CATEGORIES.DOCUMENTATION_FORMATTING_DRIFT,
      riskDomain: riskDomainForCategory(CATEGORIES.DOCUMENTATION_FORMATTING_DRIFT),
      sourcePipeline: "dependency-analysis",
      affectsArchitecture: false,
      governanceSensitive: false,
      autoFixable: true,
      humanApprovalRequired: true,
      evidence: formattingDriftEvidence,
    });
  }
  if (todos.length) {
    pushAction({
      priority: 7,
      action: "Review and triage outstanding TODO markers",
      severity: "warning",
      category: CATEGORIES.TECHNICAL_DEBT,
      riskDomain: riskDomainForCategory(CATEGORIES.TECHNICAL_DEBT),
      sourcePipeline: "project-health",
      affectsArchitecture: false,
      governanceSensitive: false,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: todos,
    });
  }
  if (mvpBlocking.length) {
    pushAction({
      priority: 8,
      action: "Confirm implementation status of MVP-critical specifications before release",
      severity: "critical",
      category: CATEGORIES.MVP_IMPLEMENTATION_PENDING,
      riskDomain: riskDomainForCategory(CATEGORIES.MVP_IMPLEMENTATION_PENDING),
      sourcePipeline: "project-health",
      affectsArchitecture: true,
      governanceSensitive: false,
      autoFixable: false,
      humanApprovalRequired: true,
      evidence: mvpBlocking,
    });
  }
  return actions.sort((a, b) => a.priority - b.priority);
}

export function renderProjectHealthMarkdown(h) {
  const lines = [];
  lines.push("## Project Health Report");
  lines.push("");
  lines.push("_Generated by scripts/eao/project-health.mjs - composes Repository Health, Broken Link Detection, Terminology Drift, and Dependency Analysis. Introduces no new detection logic beyond a reused TODO-line count._");
  lines.push("");
  lines.push("### Executive Summary");
  lines.push("");
  lines.push(
    `Overall status: **${h.overallStatus}**. ${h.criticalIssues.length} critical issue(s), ${h.warnings.length} warning(s). ` +
      `${h.dependencyHealth.nodes} tracked documents/scripts, ${h.documentationHealth.documentationCoveragePercent}% documentation coverage (files using the References/Related Documents convention).`
  );
  lines.push("");
  lines.push("### Overall Repository Health");
  lines.push("");
  lines.push(`Branch \`${h.repositoryHealth.branch}\`, ${h.repositoryHealth.aheadBehind}. Staged: ${h.repositoryHealth.stagedCount}, Unstaged: ${h.repositoryHealth.unstagedCount}, Untracked: ${h.repositoryHealth.untrackedCount}.`);
  lines.push("");
  lines.push("### Architecture Health");
  lines.push("");
  lines.push(`${h.architectureHealth.architecturalEdges} architectural (ADR) edges; ${h.architectureHealth.architecturalCycles} architectural cycle(s); ${h.architectureHealth.unreferencedCoreDocuments.length} unreferenced core document(s).`);
  lines.push("");
  lines.push("### Documentation Health");
  lines.push("");
  lines.push(`${h.documentationHealth.filesScanned} files scanned. Broken links: ${h.documentationHealth.brokenLinks}. Heading drift: ${h.documentationHealth.headingDrift}. Plain-formatting drift: ${h.documentationHealth.plainFormattingDrift}. Coverage: ${h.documentationHealth.documentationCoveragePercent}%.`);
  lines.push("");
  lines.push("### Dependency Health");
  lines.push("");
  lines.push(`${h.dependencyHealth.nodes} nodes, ${h.dependencyHealth.edges} edges. Orphans: ${h.dependencyHealth.orphans}. Genuine broken references: ${h.dependencyHealth.genuineBrokenReferences} (+ ${h.dependencyHealth.scopeArtifactBrokenReferences} scope artifacts, disclosed separately). Total cycles (by kind): ${h.dependencyHealth.totalCycles}.`);
  lines.push("");
  lines.push("### Governance Health");
  lines.push("");
  lines.push(`_${h.governanceHealth.note}_`);
  lines.push(`Tracked: ${h.governanceHealth.governanceDocsTracked.join(", ")}. Present in graph: ${h.governanceHealth.governanceDocsPresent.join(", ") || "none"}. Orphaned: ${h.governanceHealth.governanceOrphans.length}. Broken references touching them: ${h.governanceHealth.governanceBrokenRefs.length}.`);
  lines.push("");
  lines.push(`### Critical Issues — ${h.criticalIssues.length}`);
  lines.push("");
  lines.push(h.criticalIssues.length ? h.criticalIssues.map((c) => `- ${c}`).join("\n") : "- none");
  lines.push("");
  lines.push(`### Warnings — ${h.warnings.length}`);
  lines.push("");
  lines.push(h.warnings.length ? h.warnings.map((w) => `- ${w}`).join("\n") : "- none");
  lines.push("");
  lines.push("### Technical Debt Indicators");
  lines.push("");
  lines.push(`TODO count: ${h.technicalDebtIndicators.todoCount}. _${h.technicalDebtIndicators.note}_`);
  lines.push("");
  lines.push("### Documentation Coverage");
  lines.push("");
  lines.push(`${h.documentationCoverage.filesWithReferencesConvention} of ${h.documentationCoverage.totalFiles} files use the References/Related Documents convention (${h.documentationHealth.documentationCoveragePercent}%).`);
  lines.push("");
  lines.push(`### Broken References Summary — ${h.brokenReferencesSummary.genuine.length} genuine, ${h.brokenReferencesSummary.scopeArtifacts.length} scope artifacts`);
  lines.push("");
  lines.push(
    h.brokenReferencesSummary.genuine.length
      ? h.brokenReferencesSummary.genuine.map((b) => `- \`${b.file}\` (${b.section}) -> \`${b.token}\``).join("\n")
      : "- none genuine"
  );
  lines.push("");
  lines.push("### Circular Dependency Summary");
  lines.push("");
  lines.push(`Documentation: ${h.circularDependencySummary.documentation.length} (typically normal). Execution: ${h.circularDependencySummary.execution.length}. Architectural: ${h.circularDependencySummary.architectural.length}.`);
  lines.push("");
  lines.push(`### Orphan Documents Summary — ${h.orphanDocumentsSummary.length}`);
  lines.push("");
  lines.push(h.orphanDocumentsSummary.length ? h.orphanDocumentsSummary.map((o) => `- \`${o}\``).join("\n") : "- none");
  lines.push("");
  lines.push(`### Unreferenced Core Documents — ${h.unreferencedCoreDocuments.length}`);
  lines.push("");
  lines.push(h.unreferencedCoreDocuments.length ? h.unreferencedCoreDocuments.map((p) => `- \`${p}\``).join("\n") : "- none");
  lines.push("");
  lines.push("### Priority Actions (ordered by impact)");
  lines.push("");
  lines.push(
    h.priorityActions.length
      ? h.priorityActions.map((a) => `${a.priority}. ${a.action} (${a.count})`).join("\n")
      : "- none - no outstanding issues found"
  );
  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  console.log(renderProjectHealthMarkdown(computeProjectHealth()));
}
