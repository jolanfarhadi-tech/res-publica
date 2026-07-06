#!/usr/bin/env node
// Executable Dependency Analysis Pipeline - full architectural dependency graph.
// See brain/AI/EAO_EXECUTION_PIPELINES.md #5 and brain/AI/EAO_REPORTING_TEMPLATES.md #10.
//
// Foundation-first note: no second source of truth is introduced. Every edge
// below is derived from repository state that already exists:
//   - Documentation Dependencies <- existing "## Related Documents" / "## References"
//     sections (backtick and plain-text filenames within them).
//   - Execution Dependencies     <- real `import ... from "..."` statements in
//     scripts/**/*.mjs (actual code, not a declared metadata file).
//   - Architectural Dependencies <- real "ADR-###" mentions in prose, resolved
//     against actual files under architecture/adr/.
//
// Output formats (--json, --mermaid, --dot; default: markdown) are different
// renderings of the SAME computed graph - not separate data sources.
//
// Exports computeDependencyGraph() so other pipelines (Project Health) can
// compose this pipeline's result directly instead of re-deriving it.
//
// Read-only.

import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import {
  findMarkdownFiles,
  extractSection,
  extractBacktickFilenames,
  extractPlainFilenames,
  findAdrMentions,
  checkHeadingConsistency,
} from "./lib/markdown.mjs";
import { findCycles, buildReverse } from "./lib/graph.mjs";

const SOFT_KEYWORDS = ["depends on", "requires", "must ", "blocking"];
const CORE_DOCS = [
  "brain/00_constitution/00_constitution.md",
  "brain/CONSTITUTION.md",
  "brain/DOMAIN/CORE_DOMAIN_MODEL.md",
  "brain/APPLICATION/APPLICATION_ARCHITECTURE.md",
  "brain/FOUNDATION/00_MANIFESTO.md",
  "architecture/adr/ADR-001-core-platform.md",
  "architecture/adr/ADR-002-domain-model.md",
  "architecture/adr/ADR-003-plugin-architecture.md",
  "architecture/adr/ADR-004-ecc-agent-system.md",
];
const CLASSIFICATION_RANK = { hard: 4, soft: 3, reference: 2, generated: 1, optional: 0 };

function walkScripts(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkScripts(full, results);
    else if (entry.name.endsWith(".mjs")) results.push(full);
  }
  return results;
}

export function computeDependencyGraph(root = process.cwd()) {
  const coreDocs = CORE_DOCS.filter((p) => fs.existsSync(path.join(root, p)));
  const mdFiles = findMarkdownFiles(root);
  const scriptFiles = fs.existsSync(path.join(root, "scripts"))
    ? walkScripts(path.join(root, "scripts"))
    : [];
  const allFiles = [...mdFiles, ...scriptFiles];
  const byBasename = new Map(allFiles.map((f) => [path.basename(f), f]));

  // .claude/skills/*/SKILL.md files are real but out of primary scan scope
  // (docs/, brain/, architecture/), and many share the identical basename
  // "SKILL.md" - basename-only matching would be genuinely ambiguous for
  // them. Counted separately so broken-reference reporting can disclose
  // this instead of misreporting a real file as missing.
  const skillsDir = path.join(root, ".claude", "skills");
  let skillMdCount = 0;
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, "SKILL.md"))) {
        skillMdCount++;
      }
    }
  }

  const edges = [];
  const brokenRefs = [];
  const plainFormattingDrift = [];
  const mvpStatusFindings = []; // { file, blockingStatus, implementationPriority, rawText } - extracted from "## MVP Status" during the same file walk, not a second scan
  const danglingAdrReferences = []; // { file, context, adrNumber } - ADR-### mentioned in text with no matching file under architecture/adr/

  for (const file of mdFiles) {
    const base = path.basename(file);
    const content = fs.readFileSync(file, "utf8");

    const mvpStatusText = extractSection(content, "MVP Status", { exact: false });
    if (mvpStatusText) {
      const blockingMatch = mvpStatusText.match(/\*\*Blocking Status:\*\*\s*([^*.]+)/);
      const priorityMatch = mvpStatusText.match(/\*\*Implementation Priority:\*\*\s*([^*.]+)/);
      mvpStatusFindings.push({
        file: path.relative(root, file),
        blockingStatus: blockingMatch ? blockingMatch[1].trim() : "Unclear",
        implementationPriority: priorityMatch ? priorityMatch[1].trim() : "Unclear",
        rawText: mvpStatusText.slice(0, 300),
      });
    }

    for (const sectionName of ["Related Documents", "References"]) {
      const sectionText = extractSection(content, sectionName);
      if (!sectionText) continue;

      const backtickNames = extractBacktickFilenames(sectionText);
      const { filenames: plainNames, hadPlainFormatting } = extractPlainFilenames(sectionText);
      if (hadPlainFormatting) {
        plainFormattingDrift.push({ file: path.relative(root, file), section: sectionName });
      }

      const isSoft = SOFT_KEYWORDS.some((kw) => sectionText.toLowerCase().includes(kw));
      const allNames = new Set([...backtickNames, ...plainNames]);

      for (const name of allNames) {
        if (name === base) continue;
        if (byBasename.has(name)) {
          edges.push({
            from: base,
            to: name,
            kind: "documentation",
            classification: isSoft ? "soft" : "reference",
          });
        } else if (name === "SKILL.md" && skillMdCount > 0) {
          brokenRefs.push({
            file: path.relative(root, file),
            section: sectionName,
            token: name,
            note: `resolves to one of ${skillMdCount} identically-named files under .claude/skills/ - out of primary scan scope, ambiguous by basename, not actually missing`,
          });
        } else {
          brokenRefs.push({ file: path.relative(root, file), section: sectionName, token: name });
        }
      }

      for (const adrNum of findAdrMentions(sectionText)) {
        const target = [...byBasename.keys()].find((n) => n.startsWith(adrNum));
        if (target) {
          edges.push({ from: base, to: target, kind: "architectural", classification: "reference" });
        } else {
          danglingAdrReferences.push({ file: path.relative(root, file), context: sectionName, adrNumber: adrNum });
        }
      }
    }

    for (const adrNum of findAdrMentions(content)) {
      const target = [...byBasename.keys()].find((n) => n.startsWith(adrNum));
      if (target && target !== base) {
        const already = edges.some((e) => e.from === base && e.to === target && e.kind === "architectural");
        if (!already) edges.push({ from: base, to: target, kind: "architectural", classification: "optional" });
      } else if (!target) {
        const alreadyDangling = danglingAdrReferences.some((d) => d.file === path.relative(root, file) && d.adrNumber === adrNum);
        if (!alreadyDangling) {
          danglingAdrReferences.push({ file: path.relative(root, file), context: "body text", adrNumber: adrNum });
        }
      }
    }
  }

  for (const file of scriptFiles) {
    const base = path.basename(file);
    const content = fs.readFileSync(file, "utf8");
    const imports = [...content.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    for (const imp of imports) {
      if (!imp.startsWith(".")) continue;
      const resolved = path.basename(path.resolve(path.dirname(file), imp));
      if (byBasename.has(resolved)) {
        edges.push({ from: base, to: resolved, kind: "execution", classification: "hard" });
      }
    }
  }

  const generatedCount = mdFiles.filter((f) => /_Generated by /.test(fs.readFileSync(f, "utf8"))).length;

  const dedupedByKey = new Map();
  for (const e of edges) {
    const key = `${e.from} ${e.to} ${e.kind}`;
    const existing = dedupedByKey.get(key);
    if (!existing || CLASSIFICATION_RANK[e.classification] > CLASSIFICATION_RANK[existing.classification]) {
      dedupedByKey.set(key, e);
    }
  }
  const dedupedEdges = [...dedupedByKey.values()];

  const adjacency = new Map();
  const adjacencyByKind = { documentation: new Map(), execution: new Map(), architectural: new Map() };
  for (const e of dedupedEdges) {
    if (!adjacency.has(e.from)) adjacency.set(e.from, new Set());
    adjacency.get(e.from).add(e.to);
    const kindMap = adjacencyByKind[e.kind];
    if (!kindMap.has(e.from)) kindMap.set(e.from, new Set());
    kindMap.get(e.from).add(e.to);
  }
  const reverseAdjacency = buildReverse(adjacency);
  const cyclesByKind = {
    documentation: findCycles(adjacencyByKind.documentation),
    execution: findCycles(adjacencyByKind.execution),
    architectural: findCycles(adjacencyByKind.architectural),
  };

  const optedIn = mdFiles.filter((f) => {
    const content = fs.readFileSync(f, "utf8");
    return extractSection(content, "Related Documents") || extractSection(content, "References");
  });
  const orphans = optedIn.map((f) => path.basename(f)).filter((b) => !adjacency.has(b) && !reverseAdjacency.has(b));

  const unreferencedCore = coreDocs.filter((p) => {
    const base = path.basename(p);
    return !reverseAdjacency.has(base) || reverseAdjacency.get(base).size === 0;
  });

  const headingDrift = checkHeadingConsistency(
    mdFiles.filter((f) => path.basename(f).startsWith("EAO_")),
    "References"
  ).map((d) => ({ file: path.relative(root, d.file), actualHeading: d.actualHeading }));

  return {
    nodes: [...byBasename.keys()],
    edges: dedupedEdges,
    adjacency,
    reverseAdjacency,
    cyclesByKind,
    orphans,
    brokenReferences: brokenRefs,
    unreferencedCoreDocuments: unreferencedCore,
    plainFormattingDrift,
    headingDrift,
    generatedCount,
    mdFilesScanned: mdFiles.length,
    optedInCount: optedIn.length,
    danglingAdrReferences,
    mvpStatusFindings,
  };
}

function sanitizeId(name) {
  return name.replace(/[^A-Za-z0-9]/g, "_");
}

export function renderDependencyGraphJson(result) {
  return JSON.stringify(
    {
      nodes: result.nodes,
      edges: result.edges,
      cyclesByKind: result.cyclesByKind,
      orphans: result.orphans,
      brokenReferences: result.brokenReferences,
      unreferencedCoreDocuments: result.unreferencedCoreDocuments,
      danglingAdrReferences: result.danglingAdrReferences,
    },
    null,
    2
  );
}

export function renderDependencyGraphMermaid(result) {
  const lines = ["graph LR"];
  for (const e of result.edges) {
    lines.push(`  ${sanitizeId(e.from)}["${e.from}"] -->|${e.kind}/${e.classification}| ${sanitizeId(e.to)}["${e.to}"]`);
  }
  return lines.join("\n");
}

export function renderDependencyGraphDot(result) {
  const lines = ["digraph EAO_Dependencies {"];
  for (const e of result.edges) {
    lines.push(`  "${e.from}" -> "${e.to}" [label="${e.kind}/${e.classification}"];`);
  }
  lines.push("}");
  return lines.join("\n");
}

export function renderDependencyGraphMarkdown(result) {
  const { nodes, edges, reverseAdjacency, cyclesByKind, orphans, brokenReferences, unreferencedCoreDocuments, plainFormattingDrift, headingDrift, generatedCount, danglingAdrReferences } = result;
  const lines = [];
  lines.push("## Dependency Map");
  lines.push("");
  lines.push(
    "_Generated by scripts/eao/dependency-map.mjs - EAO_EXECUTION_PIPELINES.md #5. " +
      "Run with --json, --mermaid, or --dot for alternate output formats of this same graph._"
  );
  lines.push("");
  lines.push(`**Nodes:** ${nodes.length} (docs + scripts). **Edges:** ${edges.length}.`);
  lines.push("");

  for (const kind of ["documentation", "execution", "architectural"]) {
    const kindEdges = edges.filter((e) => e.kind === kind);
    lines.push(`### ${kind[0].toUpperCase()}${kind.slice(1)} Dependencies (${kindEdges.length})`);
    lines.push("");
    const byFrom = new Map();
    for (const e of kindEdges) {
      if (!byFrom.has(e.from)) byFrom.set(e.from, []);
      byFrom.get(e.from).push(e);
    }
    for (const [from, es] of [...byFrom.entries()].sort()) {
      lines.push(`- \`${from}\` -> ${es.map((e) => `\`${e.to}\` (${e.classification})`).join(", ")}`);
    }
    if (!byFrom.size) lines.push("- none");
    lines.push("");
  }

  lines.push("### Reverse Dependencies (most-referenced, top 10)");
  lines.push("");
  const ranked = [...reverseAdjacency.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 10);
  for (const [base, refs] of ranked) {
    lines.push(`- \`${base}\` <- referenced by ${refs.size}: ${[...refs].sort().map((r) => `\`${r}\``).join(", ")}`);
  }
  lines.push("");

  const totalCycles = cyclesByKind.documentation.length + cyclesByKind.execution.length + cyclesByKind.architectural.length;
  lines.push(`### Circular Dependencies — ${totalCycles} (by kind, not combined)`);
  lines.push("");
  lines.push(
    "_Documentation-kind cycles are typically normal (mutual cross-referencing between related " +
      "docs is expected practice, not a defect). Execution-kind cycles would be a genuine code " +
      "problem; Architectural-kind cycles between ADRs warrant review._"
  );
  lines.push("");
  for (const kind of ["documentation", "execution", "architectural"]) {
    const kindCycles = cyclesByKind[kind];
    lines.push(`**${kind[0].toUpperCase()}${kind.slice(1)} (${kindCycles.length}):**`);
    lines.push(kindCycles.length ? kindCycles.map((c) => `- ${c.join(" -> ")}`).join("\n") : "- none");
    lines.push("");
  }

  lines.push(`### Broken References — ${brokenReferences.length}`);
  lines.push("");
  lines.push(
    brokenReferences.length
      ? brokenReferences
          .map((b) => `- \`${b.file}\` (${b.section}) -> \`${b.token}\`${b.note ? ` (${b.note})` : " (no matching file)"}`)
          .join("\n")
      : "- none"
  );
  lines.push("");

  lines.push(`### Orphan Documents (opted into convention, zero edges) — ${orphans.length}`);
  lines.push("");
  lines.push(orphans.length ? orphans.map((o) => `- \`${o}\``).join("\n") : "- none");
  lines.push("");

  lines.push(`### Unreferenced Core Documents — ${unreferencedCoreDocuments.length}`);
  lines.push("");
  lines.push(
    unreferencedCoreDocuments.length
      ? unreferencedCoreDocuments.map((p) => `- \`${p}\` (0 inbound references of any kind)`).join("\n")
      : "- none"
  );
  lines.push("");

  lines.push(`### Dangling ADR References — ${danglingAdrReferences.length}`);
  lines.push("");
  lines.push(
    "_ADR numbers mentioned in text with no matching file under architecture/adr/ - previously " +
      "silently dropped; now surfaced, since a mention of a non-existent ADR is itself a real " +
      "architectural signal (typo, or a decision that was referenced as if made but never recorded)._"
  );
  lines.push("");
  lines.push(
    danglingAdrReferences.length
      ? danglingAdrReferences.map((d) => `- \`${d.file}\` (${d.context}) -> \`${d.adrNumber}\` (no matching file)`).join("\n")
      : "- none"
  );
  lines.push("");

  lines.push(`### Generated-artifact markers found — ${generatedCount}`);
  lines.push(
    "_(files whose content self-declares '_Generated by ...' - honestly 0 unless a persisted " +
      "file adopts that convention; script console output isn't a file)_"
  );
  lines.push("");

  lines.push(`### Documentation Health — heading-depth drift ("References") — ${headingDrift.length}`);
  lines.push("");
  if (headingDrift.length) {
    lines.push("Not fixed automatically - reported per Foundation-First policy.");
    for (const d of headingDrift) {
      lines.push(`- \`${d.file}\` uses \`${d.actualHeading}\` instead of \`## References\``);
    }
  } else {
    lines.push("- none");
  }
  lines.push("");

  lines.push(`### Documentation Health — plain-text (non-backtick) filename formatting — ${plainFormattingDrift.length}`);
  lines.push("");
  lines.push(
    plainFormattingDrift.length
      ? plainFormattingDrift.map((d) => `- \`${d.file}\` (${d.section})`).join("\n")
      : "- none"
  );
  lines.push("");
  lines.push(
    "**Classification note, disclosed:** Soft/Reference/Optional classifications are heuristic " +
      "(keyword- and location-based on real text), not authoritative metadata - Hard (execution " +
      "imports) is the only classification derived from an unambiguous signal."
  );
  return lines.join("\n");
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const format = process.argv.includes("--json")
    ? "json"
    : process.argv.includes("--mermaid")
    ? "mermaid"
    : process.argv.includes("--dot")
    ? "dot"
    : "markdown";
  const result = computeDependencyGraph();
  if (format === "json") console.log(renderDependencyGraphJson(result));
  else if (format === "mermaid") console.log(renderDependencyGraphMermaid(result));
  else if (format === "dot") console.log(renderDependencyGraphDot(result));
  else console.log(renderDependencyGraphMarkdown(result));
}
