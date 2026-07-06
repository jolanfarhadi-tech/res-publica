#!/usr/bin/env node
// Executable ADR Review Pipeline - Architectural Decision Gap Analysis.
// See brain/AI/EAO_EXECUTION_PIPELINES.md #4.
//
// Foundation-first note: no new repository scanning, no second source of
// truth. Every finding below is derived from the already-computed
// Dependency Analysis graph (architectural edges, cycles, dangling ADR
// references) and Project Health's canonical action model - this pipeline
// only re-groups and re-interprets that existing data for ADR-coverage
// purposes, it does not re-scan the repository or re-implement any
// dependency-analysis logic.
//
// Read-only.

import { pathToFileURL } from "node:url";
import { computeDependencyGraph } from "./dependency-map.mjs";
import { computeProjectHealth } from "./project-health.mjs";
import { CATEGORIES } from "./lib/registry.mjs";

function isAdrFile(name) {
  return /^ADR-\d{3}/.test(name);
}

export function computeAdrReview(root = process.cwd()) {
  const deps = computeDependencyGraph(root);
  const health = computeProjectHealth(root);

  const adrFiles = deps.nodes.filter(isAdrFile);
  const architecturalEdges = deps.edges.filter((e) => e.kind === "architectural");

  // ---- ADR Coverage Report ----
  // For every real ADR, classify how it is cited elsewhere:
  //   - Formally Covered: at least one inbound edge classified "reference"
  //     (the citing document formally lists it in References/Related Documents).
  //   - Incidentally Mentioned Only: inbound edges exist, but all are
  //     "optional" (a passing body-text mention, never a formal citation).
  //   - Uncited: no inbound architectural edge at all.
  const coverageReport = adrFiles.map((adr) => {
    const inbound = architecturalEdges.filter((e) => e.to === adr);
    const formal = inbound.filter((e) => e.classification === "reference");
    const status = formal.length ? "Formally Covered" : inbound.length ? "Incidentally Mentioned Only" : "Uncited";
    return { adr, status, citedBy: inbound.map((e) => ({ from: e.from, classification: e.classification })) };
  });

  // ---- Architecture Changes Covered by Existing ADRs ----
  // Non-ADR documents with an outbound "reference"-classified architectural
  // edge - i.e. they formally cite an ADR as their backing decision.
  //
  // Reverse-consistency check, corrected: an earlier draft flagged every
  // single covered change as "inconsistent" if the ADR didn't cite the
  // document back - but only 2 of 24 ADR files have a References/Related
  // Documents section at all (ADRs are structurally decision-records:
  // Context/Decision/Consequences, not documents that maintain a reverse
  // citation list). That made "inconsistent" fire 6/6 times - noise, not
  // signal. Corrected: only assess reverse-consistency for ADRs that
  // participate in the citation convention at all (have >=1 outbound
  // architectural edge of their own); otherwise mark "not applicable" rather
  // than falsely flagging every case.
  const adrsWithOutboundArchEdges = new Set(architecturalEdges.filter((e) => isAdrFile(e.from)).map((e) => e.from));
  const coveredChanges = architecturalEdges
    .filter((e) => e.classification === "reference" && !isAdrFile(e.from))
    .map((e) => {
      const reverseApplicable = adrsWithOutboundArchEdges.has(e.to);
      const reverseConsistent = reverseApplicable
        ? architecturalEdges.some((r) => r.from === e.to && r.to === e.from)
        : null;
      return { document: e.from, adr: e.to, reverseApplicable, reverseConsistent };
    });

  // ---- Existing ADRs Requiring Revision ----
  // Deliberately ONE signal, not two. An earlier draft of this pipeline also
  // flagged every "Incidentally Mentioned Only" ADR (coverage report above)
  // as "requiring revision" - that produced 22 of 24 ADRs flagged, since most
  // of the pre-existing repository (Constitution, Core Domain Model, etc.)
  // never adopted the formal-citation convention that this session mostly
  // introduced for newer EAO/methodology documents. That conflated "this
  // document doesn't use a citation style" with "this ADR has a defect" -
  // not a meaningful or actionable signal at that scale. Coverage status
  // remains fully visible in the ADR Coverage Report above (descriptive);
  // only the cycle signal below - a precise, small-count, genuinely
  // structural finding - escalates to "requires revision."
  const adrsInCycles = new Set(deps.cyclesByKind.architectural.flat());
  const adrsRequiringRevision = [...adrsInCycles].map((adr) => ({
    adr,
    reason: "Involved in an ADR-to-ADR architectural cycle",
    evidence: deps.cyclesByKind.architectural.filter((c) => c.includes(adr)),
  }));

  // ---- Missing ADR Candidates ----
  // 1. Dangling ADR references (dependency-map.mjs) - a document expects an
  //    ADR number that doesn't exist: either a typo, or a decision referenced
  //    as if made but never formally recorded. The strongest, most concrete
  //    signal available.
  // 2. Project Health's "unreferenced-core-document" canonical action -
  //    reused directly (not re-scanned) since it already identifies
  //    foundational documents with zero inbound references of any kind.
  const missingAdrCandidates = [
    ...deps.danglingAdrReferences.map((d) => ({
      candidateFor: d.adrNumber,
      reason: `Referenced in \`${d.file}\` (${d.context}) but no matching ADR file exists`,
      source: "dependency-analysis (dangling ADR reference)",
      evidence: d,
    })),
    ...(health.priorityActions.find((a) => a.category === CATEGORIES.UNREFERENCED_CORE_DOCUMENT)?.evidence || []).map((doc) => ({
      candidateFor: doc,
      reason: "Unreferenced core document (Project Health) - foundational document with zero inbound references; may need its own ADR to formally record why it stands alone",
      source: "project-health (canonical action model)",
      evidence: doc,
    })),
  ];

  const executiveSummary = {
    totalAdrs: adrFiles.length,
    formallyCovered: coverageReport.filter((c) => c.status === "Formally Covered").length,
    incidentalOnly: coverageReport.filter((c) => c.status === "Incidentally Mentioned Only").length,
    uncited: coverageReport.filter((c) => c.status === "Uncited").length,
    coveredChangesCount: coveredChanges.length,
    inconsistentCoveredChanges: coveredChanges.filter((c) => c.reverseApplicable && !c.reverseConsistent).length,
    adrsRequiringRevisionCount: adrsRequiringRevision.length,
    missingAdrCandidatesCount: missingAdrCandidates.length,
  };

  return { schemaVersion: health.schemaVersion, executiveSummary, coverageReport, coveredChanges, adrsRequiringRevision, missingAdrCandidates };
}

export function renderAdrReviewMarkdown(result) {
  const { executiveSummary: s, coverageReport, coveredChanges, adrsRequiringRevision, missingAdrCandidates } = result;
  const lines = [];
  lines.push("## ADR Review Report — Architectural Decision Gap Analysis");
  lines.push("");
  lines.push(
    "_Generated by scripts/eao/adr-review.mjs - composes computeDependencyGraph() and computeProjectHealth() as its only inputs. No additional repository scanning performed._"
  );
  lines.push("");

  lines.push("### Executive ADR Review");
  lines.push("");
  lines.push(
    `${s.totalAdrs} ADR(s) tracked: ${s.formallyCovered} Formally Covered, ${s.incidentalOnly} Incidentally Mentioned Only, ${s.uncited} Uncited. ` +
      `${s.coveredChangesCount} architecture change(s) formally covered by an existing ADR (${s.inconsistentCoveredChanges} with an inconsistent reverse reference). ` +
      `${s.adrsRequiringRevisionCount} ADR(s) flagged for possible revision. ${s.missingAdrCandidatesCount} missing-ADR candidate(s).`
  );
  lines.push("");

  lines.push("### ADR Coverage Report");
  lines.push("");
  lines.push("| ADR | Status | Cited By |");
  lines.push("|---|---|---|");
  for (const c of coverageReport) {
    lines.push(`| ${c.adr} | ${c.status} | ${c.citedBy.map((x) => `${x.from} (${x.classification})`).join(", ") || "none"} |`);
  }
  if (!coverageReport.length) lines.push("| _none_ | | |");
  lines.push("");

  lines.push("### Architecture Changes Covered by Existing ADRs");
  lines.push("");
  lines.push(
    "_Reverse-consistency is only assessed for ADRs that themselves participate in the citation " +
      "convention (have their own outbound architectural edges) - most ADRs are decision-records " +
      "with no Related Documents/References section at all, so \"not applicable\" there is expected, not a defect._"
  );
  lines.push("");
  lines.push(
    coveredChanges.length
      ? coveredChanges
          .map((c) => {
            const note = !c.reverseApplicable
              ? " _(reverse-consistency not applicable - ADR has no outbound citations of its own)_"
              : c.reverseConsistent
              ? ""
              : " **(inconsistent: ADR does not cite this document back)**";
            return `- \`${c.document}\` -> ${c.adr}${note}`;
          })
          .join("\n")
      : "- none"
  );
  lines.push("");

  lines.push("### Existing ADRs Requiring Revision");
  lines.push("");
  lines.push(
    adrsRequiringRevision.length
      ? adrsRequiringRevision.map((r) => `- ${r.adr}: ${r.reason}`).join("\n")
      : "- none"
  );
  lines.push("");

  lines.push("### Missing ADR Candidates");
  lines.push("");
  lines.push(
    missingAdrCandidates.length
      ? missingAdrCandidates.map((m) => `- ${m.candidateFor}: ${m.reason} _(source: ${m.source})_`).join("\n")
      : "- none"
  );
  lines.push("");

  lines.push("### Human Approval Required Decisions");
  lines.push("");
  lines.push(
    "_Every item below requires explicit human approval before any ADR is created, amended, or its status changed - this pipeline only recommends, per EAO_PERMISSION_MODEL.md._"
  );
  const approvalItems = [
    ...adrsRequiringRevision.map((r) => `Amend or clarify ${r.adr} (${r.reason})`),
    ...missingAdrCandidates.map((m) => `Decide whether ${m.candidateFor} needs a new ADR, or the reference should be corrected/removed (${m.reason})`),
  ];
  lines.push(approvalItems.length ? approvalItems.map((a) => `- ${a}`).join("\n") : "- none");
  lines.push("");

  lines.push("### Evidence References");
  lines.push("");
  lines.push(`- ADR Coverage Report: derived from ${coverageReport.length} ADR file(s) x architectural edges (Dependency Analysis)`);
  lines.push(`- ADRs Requiring Revision: ${adrsRequiringRevision.length} finding(s), each traceable to a cycle or citation-pattern in the Dependency Analysis graph`);
  lines.push(`- Missing ADR Candidates: ${missingAdrCandidates.length} finding(s), each traceable to a dangling ADR reference (Dependency Analysis) or an unreferenced-core-document action (Project Health)`);

  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  console.log(renderAdrReviewMarkdown(computeAdrReview()));
}
