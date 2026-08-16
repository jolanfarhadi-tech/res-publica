#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const SECRET_NAME = "DATABASE_URL|OIDC_CLIENT_SECRET|AUTH0_CLIENT_SECRET|VERCEL_TOKEN|NEON_API_KEY|SMTP_PASSWORD|API_KEY|PRIVATE_KEY|RECOVERY_CODE|SIGNING_KEY";
const EQUALS_ASSIGNMENT = new RegExp(`\\b(${SECRET_NAME})\\b\\s*=\\s*["']?([^\\s"',;}{]{8,})`, "gi");
const COLON_STRING_ASSIGNMENT = new RegExp(`\\b(${SECRET_NAME})\\b\\s*:\\s*["']([^"']{8,})["']`, "gi");
const DATABASE_CREDENTIAL_URL = /postgres(?:ql)?:\/\/[^\s:/@]+:([^\s/@]+)@[^\s/]+/gi;
const PRIVATE_KEY_BLOCK = /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g;
const PLACEHOLDER = /(example|placeholder|redacted|changeme|dummy|fake|not-a-secret|your[_-]|process\.env|\$\{|<[^>]+>)/i;

function isCandidate(value) {
  if (PLACEHOLDER.test(value)) return false;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(value)).length;
  return value.length >= 16 && classes >= 2;
}

export function scanText(text, source) {
  if (text.includes("\0")) return [];
  const findings = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    PRIVATE_KEY_BLOCK.lastIndex = 0;
    if (PRIVATE_KEY_BLOCK.test(line)) findings.push({ source, line: index + 1, rule: "private-key-block" });
    for (const rule of [EQUALS_ASSIGNMENT, COLON_STRING_ASSIGNMENT]) {
      rule.lastIndex = 0;
      for (const match of line.matchAll(rule)) {
        if (isCandidate(match[2])) findings.push({ source, line: index + 1, rule: "credential-assignment" });
      }
    }
    DATABASE_CREDENTIAL_URL.lastIndex = 0;
    for (const match of line.matchAll(DATABASE_CREDENTIAL_URL)) {
      if (!PLACEHOLDER.test(match[1]) && match[1].length >= 8) {
        findings.push({ source, line: index + 1, rule: "database-credential-url" });
      }
    }
  }
  return findings;
}

function git(root, args, maxBuffer = 256 * 1024 * 1024) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer });
  if (result.status !== 0) throw new Error(`git_${args[0]}_failed`);
  return result.stdout;
}

export function scanRepository(root = process.cwd()) {
  const findings = [];
  const tracked = git(root, ["ls-files", "-z"]).split("\0").filter(Boolean);
  for (const relative of tracked) {
    const absolute = path.join(root, relative);
    const stat = fs.statSync(absolute);
    if (stat.size > 5 * 1024 * 1024) continue;
    findings.push(...scanText(fs.readFileSync(absolute, "utf8"), `tree:${relative}`));
  }

  const history = git(root, [
    "log", "--all", "-p", "--no-ext-diff", "--unified=0", "--",
    ".", ":(exclude)package-lock.json",
  ]);
  let currentFile = "unknown";
  const historyLines = [];
  for (const line of history.split(/\r?\n/)) {
    if (line.startsWith("+++ b/")) currentFile = line.slice(6);
    if (line.startsWith("+") && !line.startsWith("+++")) historyLines.push(`${currentFile}\t${line.slice(1)}`);
  }
  for (const [index, entry] of historyLines.entries()) {
    const separator = entry.indexOf("\t");
    const file = entry.slice(0, separator);
    const line = entry.slice(separator + 1);
    findings.push(...scanText(line, `history:${file}`).map((finding) => ({ ...finding, line: index + 1 })));
  }

  return [...new Map(findings.map((finding) => [`${finding.source}:${finding.rule}`, finding])).values()];
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const findings = scanRepository();
  if (findings.length) {
    console.error(`Secret scan failed: ${findings.length} high-confidence finding(s). Values are intentionally suppressed.`);
    for (const finding of findings) console.error(`- ${finding.rule} in ${finding.source}`);
    process.exitCode = 1;
  } else {
    console.log("✓ Active tree and Git history contain no high-confidence secret pattern");
  }
}
