/** Build a temporary source copy; never collide with the live .next dev cache.
 * No .env, credentials, git metadata or user documents are copied.
 */
import { cp, mkdtemp, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const source = process.cwd();
const target = await mkdtemp(path.join(os.tmpdir(), "res-publica-build-"));
for (const input of ["src", "lib", "public", "datenschutz.md", "impressum.md", "package.json", "package-lock.json", "next.config.ts", "next-env.d.ts", "tsconfig.json", "middleware.ts", "postcss.config.mjs", "eslint.config.mjs"]) {
  await cp(path.join(source, input), path.join(target, input), { recursive: true, errorOnExist: true, force: false });
}
await symlink(path.join(source, "node_modules"), path.join(target, "node_modules"), process.platform === "win32" ? "junction" : "dir");
const allowed = new Set(["path", "systemroot", "windir", "comspec", "temp", "tmp", "userprofile", "appdata", "localappdata"]);
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.has(key.toLowerCase())));
env.NODE_ENV = "production";
env.NEXT_TELEMETRY_DISABLED = "1";
console.log(`Isolated build: ${target}`);
const child = spawn(process.execPath, [path.join(source, "node_modules/next/dist/bin/next"), "build", target], { cwd: target, env, stdio: "inherit", windowsHide: true });
child.on("error", error => { console.error(error.message); process.exitCode = 1; });
child.on("exit", async code => {
  const exitCode = code ?? 1;
  await writeFile(path.join(target, "build-result.json"), JSON.stringify({ exitCode, finishedAt: new Date().toISOString() }, null, 2));
  console.log(`Isolated build result: ${exitCode} (${target})`);
  process.exitCode = exitCode;
});
