/**
 * Structure guard — fails fast if the project drifts back into a
 * broken double-router state. Runs automatically before dev/build.
 *
 * Rules:
 *  1. Exactly one App Router tree: src/app (a root app/ is fatal,
 *     because Next.js would silently ignore src/app).
 *  2. The dynamic segment is [locale], not [lang].
 *  3. Exactly one middleware file, at the project root.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const problems = [];

if (fs.existsSync(path.join(root, "app"))) {
  problems.push(
    "A root-level `app/` folder exists. Next.js will use it and IGNORE " +
      "`src/app`, causing 404s. Move anything you still need into " +
      "`src/app/[locale]/...`, then delete the root `app/` folder."
  );
}

if (fs.existsSync(path.join(root, "src", "app", "[lang]"))) {
  problems.push(
    "`src/app/[lang]` exists. This project uses `[locale]` as its only " +
      "dynamic segment. Merge the contents into `src/app/[locale]` and " +
      "rename any `params.lang` to `params.locale`."
  );
}

if (!fs.existsSync(path.join(root, "src", "app", "[locale]", "layout.tsx"))) {
  problems.push("`src/app/[locale]/layout.tsx` is missing.");
}

const hasSrcContent = fs.existsSync(path.join(root, "src", "content"));
const hasRootContent = fs.existsSync(path.join(root, "content"));
if (!hasSrcContent && !hasRootContent) {
  problems.push(
    "No content folder found. Collections and pages expect " +
      "`src/content/<locale>/...` (canonical) or `content/<locale>/...`."
  );
}
if (hasSrcContent && hasRootContent) {
  problems.push(
    "Both `src/content` and `content` exist. Merge everything into " +
      "`src/content` and delete the root `content/` folder, otherwise " +
      "edits in the ignored folder will silently not appear on the site."
  );
}

for (const stray of ["src/middleware.ts", "src/app/middleware.ts"]) {
  if (fs.existsSync(path.join(root, stray))) {
    problems.push(
      `Duplicate middleware at \`${stray}\`. Keep only the root ` +
        "`middleware.ts` and delete this one."
    );
  }
}

if (problems.length > 0) {
  console.error("\n✖ Project structure problems:\n");
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  process.exit(1);
}
console.log("✓ Project structure OK (single App Router: src/app/[locale])");
