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
