import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const lockfile = JSON.parse(
  fs.readFileSync(path.join(root, "package-lock.json"), "utf8")
);
const ciWorkflow = fs.readFileSync(
  path.join(root, ".github", "workflows", "ci.yml"),
  "utf8"
);

function versionParts(version) {
  return version.replace(/^[^\d]*/, "").split(".").map(Number);
}

function isAtLeast(actual, minimum) {
  const actualParts = versionParts(actual);
  const minimumParts = versionParts(minimum);
  for (let index = 0; index < 3; index += 1) {
    if (actualParts[index] > minimumParts[index]) return true;
    if (actualParts[index] < minimumParts[index]) return false;
  }
  return true;
}

describe("dependency security policy", () => {
  it("keeps a production-only advisory gate available to CI and release checks", () => {
    expect(manifest.scripts["audit:production"]).toBe(
      "npm audit --omit=dev --audit-level=high"
    );
    expect(ciWorkflow).toContain("run: npm run audit:production");
  });

  it("keeps Next.js above the audited 15.x security floor", () => {
    expect(isAtLeast(manifest.dependencies.next, "15.5.21")).toBe(true);
    expect(lockfile.packages["node_modules/next"].version).toBe(
      versionParts(manifest.dependencies.next).join(".")
    );
  });

  it("keeps the Next.js ESLint configuration on the same release line", () => {
    const next = versionParts(manifest.dependencies.next);
    const eslintConfig = versionParts(
      manifest.devDependencies["eslint-config-next"]
    );
    expect(eslintConfig.slice(0, 2)).toEqual(next.slice(0, 2));
  });

  it("pins patched transitive dependencies used in builds and tooling", () => {
    expect(isAtLeast(manifest.overrides.postcss, "8.5.18")).toBe(true);
    expect(isAtLeast(manifest.overrides.sharp, "0.35.0")).toBe(true);
    expect(
      isAtLeast(
        manifest.overrides["@esbuild-kit/core-utils"].esbuild,
        "0.25.0"
      )
    ).toBe(true);
  });
});
