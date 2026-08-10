import fs from "node:fs";
import path from "node:path";
import { buildKnowledgeGraph } from "./build";
import { frontmatterEntityExtractor } from "./extractors/frontmatter-extractor";

export function repositoryContentDirectory(root = process.cwd()): string {
  const canonical = path.join(root, "src", "content");
  return fs.existsSync(canonical) ? canonical : path.join(root, "content");
}

export function buildRepositoryKnowledgeGraph(root = process.cwd()) {
  return buildKnowledgeGraph(
    repositoryContentDirectory(root),
    root,
    frontmatterEntityExtractor,
    "civic"
  );
}
