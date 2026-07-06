// Shared EAO utility - git access, reused across pipelines.
// EAO_SKILL_LIBRARY.md: "no skill is owned exclusively by one role" -
// this module is that principle made real: any pipeline imports it,
// none reimplements it.
// Read-only: every exported function only inspects; none mutates repo state.

import { execSync } from "node:child_process";

export function git(cmd) {
  try {
    // Strip only a trailing newline - a leading .trim() would eat the
    // meaningful leading space in `git status --short` porcelain lines
    // (" M file" = unstaged, "M  file" = staged) if that line comes first.
    return execSync(`git ${cmd}`, { encoding: "utf8" }).replace(/\r?\n$/, "");
  } catch (err) {
    return `ERROR: ${err.message.split("\n")[0]}`;
  }
}

export function getBranch() {
  return git("rev-parse --abbrev-ref HEAD").trim();
}

export function getAheadBehind() {
  try {
    const raw = execSync("git rev-list --left-right --count HEAD...@{u}", {
      encoding: "utf8",
    }).trim();
    const [ahead, behind] = raw.split(/\s+/);
    return `${ahead} ahead, ${behind} behind origin`;
  } catch {
    return "no upstream configured";
  }
}

export function getStatusPorcelain() {
  const raw = git("status --short");
  return raw ? raw.split("\n") : [];
}

export function parseStatus(lines) {
  const staged = lines.filter((l) => /^[MADRC]/.test(l));
  const unstaged = lines.filter((l) => /^.[MADRC]/.test(l) && !/^[MADRC]/.test(l));
  const untracked = lines.filter((l) => l.startsWith("??"));
  return { staged, unstaged, untracked };
}

export function getRecentLog(count = 10) {
  const raw = git(`log --oneline -${count} --pretty=format:"%h %s"`);
  return raw ? raw.split("\n") : [];
}
