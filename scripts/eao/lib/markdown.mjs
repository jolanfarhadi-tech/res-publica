// Shared EAO utility - Markdown file discovery and scanning, reused across
// Documentation Skills pipelines (Broken Link Detection, Terminology Drift
// Detection, and future Duplicate Detection / Glossary Validation).
// Read-only: every exported function only reads files; none writes.

import fs from "node:fs";
import path from "node:path";

export const DEFAULT_SCAN_DIRS = ["docs", "brain", "architecture"];

export function findMarkdownFiles(root, scanDirs = DEFAULT_SCAN_DIRS) {
  function walk(dir, results = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, results);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(full);
      }
    }
    return results;
  }

  return scanDirs
    .filter((d) => fs.existsSync(path.join(root, d)))
    .flatMap((d) => walk(path.join(root, d)));
}

export function forEachLine(file, callback) {
  const content = fs.readFileSync(file, "utf8");
  content.split("\n").forEach((lineText, idx) => callback(lineText, idx + 1));
}

// Extracts the body text of a "## <heading>" section (up to the next "##"
// heading of the same or higher level, or end of file). Returns "" if the
// heading isn't present. Generic - reusable by any pipeline that needs to
// read a specific documented section (References, Related Documents,
// MVP Status, TODO, etc.) rather than the whole file.
export function extractSection(content, heading, { exact = true } = {}) {
  const lines = content.split("\n");
  // Matches "##" or "###" - this repository's own EAO documents are not
  // consistent on heading depth for the same logical section (a real,
  // disclosed Documentation Health finding - see checkHeadingConsistency
  // below - not silently normalized away without being reported).
  //
  // exact (default true, unchanged behavior for existing callers - References,
  // Related Documents): heading text must match exactly.
  // exact: false (opt-in, e.g. "MVP Status"): matches a heading that STARTS
  // WITH the given text, since some documents use a longer variant (e.g.
  // "MVP Status & Extension Points") for the same underlying convention -
  // discovered as a real, disclosed heading-naming variant, not guessed at.
  const headingRe = exact
    ? new RegExp(`^#{2,3}\\s+${heading}\\s*$`)
    : new RegExp(`^#{2,3}\\s+${heading}\\b`);
  const startIdx = lines.findIndex((l) => headingRe.test(l.trim()));
  if (startIdx === -1) return "";
  const rest = lines.slice(startIdx + 1);
  const endIdx = rest.findIndex((l) => /^#{2,3}\s/.test(l));
  return (endIdx === -1 ? rest : rest.slice(0, endIdx)).join("\n").trim();
}

// Reports which files use a non-canonical heading depth ("###" instead of
// the majority "##") for a given section name - a disclosed Documentation
// Health finding, not something this library silently fixes.
export function checkHeadingConsistency(files, heading) {
  const drift = [];
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    const line = lines.find((l) => new RegExp(`^#{2,3}\\s+${heading}\\s*$`).test(l.trim()));
    if (line && !line.trim().startsWith(`## ${heading}`)) {
      drift.push({ file, actualHeading: line.trim() });
    }
  }
  return drift;
}

// Extracts backtick-quoted filename tokens (e.g. `EAO_ARCHITECTURE.md`) from
// a block of text - the format used by this repository's own
// References / Related Documents sections.
export function extractBacktickFilenames(text) {
  const matches = [...text.matchAll(/`([^`]+\.md)`/g)];
  // Reduce to basename: some References sections backtick-wrap a full path
  // (e.g. `brain/AI/EAO_REPORTING_TEMPLATES.md`) rather than a bare filename -
  // both are valid mentions of the same real file and must resolve the same way.
  return [...new Set(matches.map((m) => path.basename(m[1])))];
}

// Extracts filename-like tokens that are NOT wrapped in backticks (e.g. a
// drifted "References" section that writes plain "brain/AI/FOO.md" instead
// of the canonical `FOO.md` convention). Scoped to already-isolated section
// text (e.g. via extractSection) to limit false positives from unrelated
// prose elsewhere in a file. Returns { filenames, hadPlainFormatting } so
// callers can report the formatting drift rather than silently normalize it.
export function extractPlainFilenames(text) {
  const backtickSpans = [...text.matchAll(/`[^`]*`/g)].map((m) => [
    m.index,
    m.index + m[0].length,
  ]);
  const isInsideBacktick = (idx) => backtickSpans.some(([s, e]) => idx >= s && idx < e);
  const matches = [...text.matchAll(/([A-Za-z0-9_.\-/\\]+\.md)/g)].filter(
    (m) => !isInsideBacktick(m.index)
  );
  const filenames = [...new Set(matches.map((m) => path.basename(m[1])))];
  return { filenames, hadPlainFormatting: filenames.length > 0 };
}

// Finds ADR mentions (e.g. "ADR-024") anywhere in a block of text - used for
// Architectural Dependencies. Distinguishes "formal" mentions (inside an
// already-extracted References/Related Documents section, passed in as
// sectionText) from "incidental" mentions elsewhere in the document body.
export function findAdrMentions(text) {
  const matches = [...text.matchAll(/\bADR-(\d{3})\b/g)];
  return [...new Set(matches.map((m) => `ADR-${m[1]}`))];
}
