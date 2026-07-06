#!/usr/bin/env node
// Executable Roadmap Generation Pipeline.
// See brain/AI/EAO_EXECUTION_PIPELINES.md #7 and brain/AI/EAO_REPORTING_TEMPLATES.md #8, #9, #12, #13.
//
// Foundation-first note: no new detection logic and no second source of
// truth. Every backlog item below is derived directly from the already-
// computed Project Health result (priorityActions, criticalIssues,
// warnings, broken references, drift findings, dependency health) - this
// pipeline only re-phrases and re-sequences that existing data, it does not
// re-scan the repository.
//
// Read-only.

import { pathToFileURL } from "node:url";
import { computeProjectHealth } from "./project-health.mjs";

const GOVERNANCE_DOCS = ["ETHICS_CHARTER.md", "DPIA.md", "AI_POLICY.md", "DATA_POLICY.md"];

export function computeRoadmap(root = process.cwd()) {
  const health = computeProjectHealth(root);

  // ---- Requirements Backlog (EAO_REPORTING_TEMPLATES.md #8) ----
  // Each item derived 1:1 from a priorityAction already computed by Project
  // Health - severity/governanceSensitive are read directly from that source
  // (not re-inferred here via priority-number thresholds or string matching,
  // which would silently drift out of sync if Project Health's own logic changes).
  const backlog = health.priorityActions.map((action) => ({
    requirement: action.action,
    count: action.count,
    source:
      action.category === "technical-debt"
        ? "Technical Debt Indicator (Project Health)"
        : action.governanceSensitive
        ? "Governance Health finding (Project Health)"
        : action.severity === "critical"
        ? "Critical Issue (Project Health)"
        : "Warning (Project Health)",
    priorityFactors: {
      blocking: action.severity === "critical",
      risk: action.severity === "critical" ? "High" : "Low",
      governanceSensitivity: action.governanceSensitive,
    },
    // Canonical fields propagated as-is from Project Health's action model -
    // not re-derived or re-interpreted here (or by any future downstream
    // pipeline). Project Health remains the single source of truth for them.
    category: action.category,
    sourcePipeline: action.sourcePipeline,
    affectsArchitecture: action.affectsArchitecture,
    autoFixable: action.autoFixable,
    humanApprovalRequired: action.humanApprovalRequired,
    evidence: action.evidence,
    status: "Open",
  }));

  // TODO triage is now part of Project Health's own canonical priorityActions
  // (category: "technical-debt") - no longer special-cased here.

  // ---- Task Breakdown (EAO_REPORTING_TEMPLATES.md #9) ----
  // Concrete steps per backlog item; every step is human-only, since this
  // pipeline is Read Only + Suggest Only (EAO_PERMISSION_MODEL.md) and never
  // modifies a file itself.
  const taskBreakdown = backlog.map((item) => ({
    requirement: item.requirement,
    steps: [
      { step: `Review the ${item.count} item(s) underlying "${item.requirement}"`, owner: "human-only" },
      { step: "Decide correct resolution (fix, rename, remove, or accept as-is)", owner: "human-only" },
      { step: "Apply the change and re-run the relevant pipeline to confirm resolution", owner: "human-only" },
    ],
  }));

  // ---- Roadmap (EAO_REPORTING_TEMPLATES.md #12) ----
  // Phased purely by the priority factors already computed above - no new
  // scheduling logic, and explicitly non-binding until human-approved
  // (EAO_PERMISSION_MODEL.md Human Approval Gates).
  //
  // Two phases, not three: Project Health's severity model is currently
  // binary (critical/warning -> High/Low risk here), so a middle phase
  // filtered on "non-blocking but not Low risk" would always be empty by
  // construction. Reporting a phase that can structurally never contain
  // anything would be misleading, not merely conservative - collapsed to
  // the two phases the underlying data actually supports.
  const phase1 = backlog.filter((b) => b.priorityFactors.blocking);
  const phase2 = backlog.filter((b) => !b.priorityFactors.blocking);

  const roadmap = {
    nonBinding: true,
    note: "Non-binding until human-approved (EAO_PERMISSION_MODEL.md Human Approval Gates). Phased strictly by the priority factors already computed in Project Health - no new scheduling logic. Two phases only: Project Health's severity model is currently binary (critical/warning), so a third \"medium\" phase would always be empty.",
    phase1CriticalAndGovernance: phase1,
    phase2WarningsAndTechnicalDebt: phase2,
  };

  return { generatedAt: health.generatedAt, health, backlog, taskBreakdown, roadmap };
}

export function renderRequirementsBacklogMarkdown(backlog) {
  const lines = ["## Requirements Backlog", "", "| Requirement | Count | Source | Blocking | Risk | Governance-Sensitive | Status |", "|---|---|---|---|---|---|---|"];
  for (const b of backlog) {
    lines.push(`| ${b.requirement} | ${b.count} | ${b.source} | ${b.priorityFactors.blocking} | ${b.priorityFactors.risk} | ${b.priorityFactors.governanceSensitivity} | ${b.status} |`);
  }
  if (!backlog.length) lines.push("| _none_ | | | | | | |");
  return lines.join("\n");
}

export function renderTaskBreakdownMarkdown(taskBreakdown) {
  const lines = ["## Task Breakdown", ""];
  if (!taskBreakdown.length) {
    lines.push("- none");
    return lines.join("\n");
  }
  for (const item of taskBreakdown) {
    lines.push(`### ${item.requirement}`);
    lines.push("");
    for (const s of item.steps) lines.push(`- ${s.step} _(${s.owner})_`);
    lines.push("");
  }
  return lines.join("\n");
}

export function renderRoadmapMarkdown(roadmap) {
  const lines = ["## Roadmap", "", `_${roadmap.note}_`, ""];
  const phases = [
    ["Phase 1 — Critical / Governance", roadmap.phase1CriticalAndGovernance],
    ["Phase 2 — Warnings / Technical Debt", roadmap.phase2WarningsAndTechnicalDebt],
  ];
  for (const [title, items] of phases) {
    lines.push(`### ${title} (${items.length})`);
    lines.push("");
    lines.push(items.length ? items.map((i) => `- ${i.requirement} (${i.count})`).join("\n") : "- none");
    lines.push("");
  }
  return lines.join("\n");
}

export function renderGanttMermaid(roadmap) {
  // Illustrative relative sequencing only - explicitly not a real schedule
  // commitment (EAO_REPORTING_TEMPLATES.md #13: "never placeholder dates
  // presented as real schedule commitments"). Each phase gets a nominal
  // multi-day block sized only by item count, starting from today.
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    "gantt",
    "    title EAO Roadmap (illustrative sequencing only - not a committed schedule)",
    "    dateFormat  YYYY-MM-DD",
  ];
  const phases = [
    ["Phase 1 Critical/Governance", roadmap.phase1CriticalAndGovernance],
    ["Phase 2 Warnings/TechnicalDebt", roadmap.phase2WarningsAndTechnicalDebt],
  ];
  let dayOffset = 0;
  for (const [section, items] of phases) {
    lines.push(`    section ${section}`);
    if (!items.length) {
      lines.push(`    (none)           :done, ${today}, 1d`);
      continue;
    }
    for (const item of items) {
      const durationDays = Math.max(1, Math.min(item.count, 5));
      const label = item.requirement.replace(/[^A-Za-z0-9 /()-]/g, "").slice(0, 40);
      lines.push(`    ${label} :a${dayOffset}, ${today}, ${durationDays}d`);
      dayOffset += durationDays;
    }
  }
  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { backlog, taskBreakdown, roadmap } = computeRoadmap();
  const format = process.argv.includes("--gantt") ? "gantt" : process.argv.includes("--backlog") ? "backlog" : process.argv.includes("--tasks") ? "tasks" : "all";
  if (format === "gantt") {
    console.log(renderGanttMermaid(roadmap));
  } else if (format === "backlog") {
    console.log(renderRequirementsBacklogMarkdown(backlog));
  } else if (format === "tasks") {
    console.log(renderTaskBreakdownMarkdown(taskBreakdown));
  } else {
    console.log(renderRequirementsBacklogMarkdown(backlog));
    console.log("");
    console.log(renderTaskBreakdownMarkdown(taskBreakdown));
    console.log("");
    console.log(renderRoadmapMarkdown(roadmap));
    console.log("");
    console.log("## Mermaid Gantt Chart");
    console.log("");
    console.log("```mermaid");
    console.log(renderGanttMermaid(roadmap));
    console.log("```");
  }
}
