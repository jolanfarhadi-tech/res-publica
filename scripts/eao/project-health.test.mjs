import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findTodos } from "./project-health.mjs";

const temporaryRoots = [];

function createRoot(markdown) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "eao-todos-"));
  temporaryRoots.push(root);
  const docsDir = path.join(root, "docs");
  fs.mkdirSync(docsDir);
  fs.writeFileSync(path.join(docsDir, "sample.md"), markdown, "utf8");
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe("findTodos", () => {
  it("reports Markdown TODO section headings with evidence", () => {
    const root = createRoot("# Document\n\n## TODO (implementation — not started)\n\nWork remains.\n");

    expect(findTodos(root)).toEqual([
      {
        file: path.join("docs", "sample.md"),
        line: 3,
        text: "## TODO (implementation — not started)",
      },
    ]);
  });

  it("ignores historical, architectural, and detector self-references", () => {
    const root = createRoot(
      [
        "# Document",
        "",
        "This ADR describes historical TODO markers.",
        "The detector matches the literal `\\bTODO\\b` token.",
        "| Technical Debt | Outstanding TODO markers |",
      ].join("\n")
    );

    expect(findTodos(root)).toEqual([]);
  });

  it("does not treat inline labels or fenced-code examples as TODO sections", () => {
    const root = createRoot("# Document\n\nTODO: prose label\n\n```md\n## TODO (example)\n```\n");

    expect(findTodos(root)).toEqual([]);
  });
});
