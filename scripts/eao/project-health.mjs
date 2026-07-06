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

import { pathToFileURL } from "node:url";
import { findMarkdownFiles, forEachLine } from "./lib/markdown.mjs";
import { computeRepositoryHealth } from "./repository-health.mjs";
import { computeBrokenLinks } from "./broken-links.mjs";
import { computeTerminologyDrift } from "./terminology-drift.mjs";
import { computeDependencyGraph } from "./dependency-map.mjs";

function countTodos(root = process.cwd()) {
  // Reuses the existing shared file-walk/line-scan utilities (lib/markdown.mjs)
  // rather than implementing a new scan - a minimal composition, not a new pipeline.
  let count = 0;
  for (const file of findMarkdownFiles(root)) {
    forEachLine(file, (lineText) => {
      if (/\bTODO\b/.test(lineText)) count++;
    });
  }
  return count;
}

export function computeProjectHealth(root = process.cwd()) {
  const repo = computeRepositoryHealth();
  const links = computeBrokenLinks(root);
  const terminology = computeTerminologyDrift(root);
  const deps = computeDependencyGraph(root);
  const todoCount = countTodos(root);

  const genuineBrokenRefs = deps.brokenReferences.filter((b) => !b.note);
  const scopeArtifactRefs = deps.brokenReferences.filter((b) => b.note);
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
    criticalIssues,
    warnings,
    technicalDebtIndicators: {
      todoCount,
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
    priorityActions: buildPriorityActions({ terminology, genuineBrokenRefs, links, deps, governanceOrphans, governanceBrokenRefs }),
  };
}

function buildPriorityActions({ terminology, genuineBrokenRefs, links, deps, governanceOrphans, governanceBrokenRefs }) {
  const actions = [];
  if (terminology.liveDrift.length) {
    actions.push({ priority: 1, action: "Resolve live terminology drift", count: terminology.liveDrift.length });
  }
  if (governanceOrphans.length || governanceBrokenRefs.length) {
    actions.push({ priority: 2, action: "Investigate governance document connectivity issues", count: governanceOrphans.length + governanceBrokenRefs.length });
  }
  if (genuineBrokenRefs.length) {
    actions.push({ priority: 3, action: "Fix genuine broken References/Related Documents entries", count: genuineBrokenRefs.length });
  }
  if (links.broken.length) {
    actions.push({ priority: 4, action: "Fix broken Markdown links", count: links.broken.length });
  }
  if (deps.unreferencedCoreDocuments.length) {
    actions.push({ priority: 5, action: "Add inbound references to unreferenced core documents", count: deps.unreferencedCoreDocuments.length });
  }
  if (deps.headingDrift.length || deps.plainFormattingDrift.length) {
    actions.push({ priority: 6, action: "Standardize heading depth and backtick filename formatting", count: deps.headingDrift.length + deps.plainFormattingDrift.length });
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
