import fs from "node:fs";
import path from "node:path";
import { buildKnowledgeGraph } from "./build";

/** CLI entry point for `respublica graph-rebuild`, run via `tsx`. */
const root = process.cwd();
const srcContentDir = path.join(root, "src", "content");
const contentDir = fs.existsSync(srcContentDir) ? srcContentDir : path.join(root, "content");

const graph = buildKnowledgeGraph(contentDir, root);

console.log(`✓ Knowledge Graph rebuilt from ${path.relative(root, contentDir)}`);
console.log(`  entities: ${graph.entities.size}`);
console.log(`  relationships: ${graph.relationships.length}`);
if (graph.entities.size === 0) {
  console.log(
    "  (No content currently declares an `entities` frontmatter field — expected until authors start tagging entities.)"
  );
}
