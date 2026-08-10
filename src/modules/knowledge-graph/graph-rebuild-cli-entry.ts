import path from "node:path";
import { createGraphCandidateDrafts, graphContentDigest } from "./candidates";
import { buildRepositoryKnowledgeGraph, repositoryContentDirectory } from "./repository-build";

/** CLI entry point for `respublica graph-rebuild`, run via `tsx`. */
const root = process.cwd();
const contentDir = repositoryContentDirectory(root);
const graph = buildRepositoryKnowledgeGraph(root);
const drafts = createGraphCandidateDrafts(graph);

console.log(`✓ Knowledge Graph rebuilt from ${path.relative(root, contentDir)}`);
console.log(`  entities: ${graph.entities.size}`);
console.log(`  relationships: ${graph.relationships.length}`);
console.log(`  candidates: ${drafts.length}`);
console.log(`  content digest: ${graphContentDigest(drafts)}`);
if (graph.entities.size === 0) {
  console.log(
    "  (No content currently declares an `entities` frontmatter field — expected until authors start tagging entities.)"
  );
}
