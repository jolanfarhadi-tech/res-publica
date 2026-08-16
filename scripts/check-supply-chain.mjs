#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ALLOWED_INSTALL_SCRIPTS = new Set([
  "node_modules/@esbuild-kit/core-utils/node_modules/esbuild@0.25.12",
  "node_modules/drizzle-kit/node_modules/esbuild@0.25.12",
  "node_modules/esbuild@0.28.1",
  "node_modules/fsevents@2.3.3",
  "node_modules/unrs-resolver@1.12.2",
]);
const PINNED_ACTION = /uses:\s*[^\s@]+@[0-9a-f]{40}(?:\s*#.*)?$/;

export function auditSupplyChain(root = process.cwd()) {
  const issues = [];
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const lockfile = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  const nodeVersion = fs.readFileSync(path.join(root, ".nvmrc"), "utf8").trim();
  const nodeMajor = `${nodeVersion.split(".")[0]}.x`;
  if (manifest.engines?.node !== nodeMajor) issues.push("node-runtime-major-not-pinned");
  if (lockfile.packages[""]?.engines?.node !== nodeMajor) issues.push("lockfile-node-runtime-drift");

  for (const [packagePath, entry] of Object.entries(lockfile.packages)) {
    if (entry.resolved) {
      let host;
      try { host = new URL(entry.resolved).host; } catch { host = "invalid"; }
      if (host !== "registry.npmjs.org") issues.push(`unexpected-package-source:${packagePath || "root"}`);
    }
    if (entry.hasInstallScript) {
      const key = `${packagePath}@${entry.version}`;
      if (!ALLOWED_INSTALL_SCRIPTS.has(key)) issues.push(`unreviewed-install-script:${key}`);
    }
  }

  const workflows = path.join(root, ".github", "workflows");
  for (const name of fs.readdirSync(workflows).filter((name) => /\.ya?ml$/.test(name))) {
    const content = fs.readFileSync(path.join(workflows, name), "utf8");
    for (const [index, line] of content.split(/\r?\n/).entries()) {
      if (/^\s*-?\s*uses:/.test(line) && !PINNED_ACTION.test(line.trim())) {
        issues.push(`mutable-action:${name}:${index + 1}`);
      }
    }
  }

  const ci = fs.readFileSync(path.join(workflows, "ci.yml"), "utf8");
  if (!/^permissions:\r?\n\s+contents: read$/m.test(ci)) issues.push("ci-default-permissions-not-read-only");
  if (!ci.includes(`node-version: ${nodeVersion}`)) issues.push("ci-node-runtime-drift");
  if (!ci.includes("run: npm run security:secrets")) issues.push("ci-secret-scan-missing");
  if (!ci.includes("run: npm run security:supply-chain")) issues.push("ci-supply-chain-gate-missing");
  return issues;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const issues = auditSupplyChain();
  if (issues.length) {
    console.error(`Supply-chain gate failed with ${issues.length} issue(s):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    console.log("✓ Runtime, lockfile sources/install scripts, workflow pins and CI gates match policy");
  }
}
