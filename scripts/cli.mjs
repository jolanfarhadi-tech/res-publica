#!/usr/bin/env node
// respublica CLI — Foundation Build Order Step 3 (`ADR-005`).
//
// A single entry point wrapping existing npm scripts, per ADR-005's own
// decision: "introduce a single `respublica` CLI wrapping existing npm
// scripts." Contains no logic duplicating check-structure.mjs (structure)
// or content.ts (frontmatter shape) — it delegates to the first and adds
// a minimal, non-duplicating check for the second.
//
// Commands not yet implementable — honestly stubbed, not faked, per the
// "Disclosure over Fabrication" principle:
//   seed-local    — depends on Local Development Workflow (Step 4)
//   publish-draft — depends on the Publishing module (MVP #3)
//   graph-rebuild — depends on the Knowledge Graph module (MVP #1)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const [, , command, ...args] = process.argv;

function delegateToNpmScript(scriptName) {
  const result = spawnSync("npm", ["run", scriptName], { stdio: "inherit", shell: true, cwd: root });
  process.exit(result.status ?? 1);
}

function delegateToScript(relativePath) {
  const result = spawnSync("node", [relativePath], { stdio: "inherit", cwd: root });
  process.exit(result.status ?? 1);
}

function notYetAvailable(name, dependency) {
  console.error(`\n"${name}" is not yet available — it depends on ${dependency}, which has not been implemented yet.`);
  console.error("This is a disclosed gap, not a silent failure: see the Foundation Build Order for sequencing.");
  process.exit(1);
}

function findContentFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findContentFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      results.push(full);
    }
  }
  return results;
}

function validateContent() {
  const contentDir = fs.existsSync(path.join(root, "src", "content"))
    ? path.join(root, "src", "content")
    : path.join(root, "content");

  const files = findContentFiles(contentDir);
  const problems = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    if (!data.title || typeof data.title !== "string") {
      problems.push(`${file}: missing or invalid "title" in frontmatter`);
    }
    if (!data.description || typeof data.description !== "string") {
      problems.push(`${file}: missing or invalid "description" in frontmatter`);
    }
  }

  if (problems.length > 0) {
    console.error(`\n✖ Content validation found ${problems.length} problem(s):\n`);
    problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
    process.exit(1);
  }
  console.log(`✓ Content OK (${files.length} MDX file(s) checked)`);
}

async function validateModule(manifestPath) {
  if (!manifestPath) {
    console.error('Usage: respublica validate-module <path-to-manifest.json>');
    console.error("(No module manifests are registered yet — Foundation Build Order Step 5 — so this validates a manifest file directly.)");
    process.exit(1);
  }
  const { moduleManifestSchema } = await import("../src/modules/manifest.ts");
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const result = moduleManifestSchema.safeParse(raw);
  if (!result.success) {
    console.error(`\n✖ Invalid manifest at ${manifestPath}:\n`);
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  console.log(`✓ Manifest valid: "${result.data.moduleName}"`);
}

function seedLocal() {
  // Foundation Build Order Step 4 (ADR-006): repository-local fixture mode.
  // No database, no external service — an in-memory store, reset every run.
  // Run via `tsx`, which resolves this project's extensionless relative
  // imports correctly (bundler-style resolution), unlike Node's plain ESM
  // loader.
  const result = spawnSync("npx", ["tsx", "src/local-dev/seed-cli-entry.ts"], {
    stdio: "inherit",
    shell: true,
    cwd: root,
  });
  process.exit(result.status ?? 1);
}

switch (command) {
  case "dev":
    delegateToNpmScript("dev");
    break;
  case "build":
    delegateToNpmScript("build");
    break;
  case "check-structure":
    delegateToScript("scripts/check-structure.mjs");
    break;
  case "validate-content":
    validateContent();
    break;
  case "validate-module":
    await validateModule(args[0]);
    break;
  case "seed-local":
    seedLocal();
    break;
  case "publish-draft":
    notYetAvailable(
      "publish-draft",
      "the Backend Architecture persistence layer — Publishing's own domain logic is implemented and tested " +
        "(src/modules/publishing/), but there is nowhere yet to look up a draft by id from the CLI"
    );
    break;
  case "graph-rebuild": {
    const result = spawnSync("npx", ["tsx", "src/modules/knowledge-graph/graph-rebuild-cli-entry.ts"], {
      stdio: "inherit",
      shell: true,
      cwd: root,
    });
    process.exit(result.status ?? 1);
  }
  default:
    console.error(`Unknown command: "${command ?? "(none)"}"`);
    console.error("Available: dev, build, check-structure, validate-content, validate-module, seed-local, publish-draft, graph-rebuild");
    process.exit(1);
}
