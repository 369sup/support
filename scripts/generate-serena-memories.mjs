import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import {
  loadSerenaMemorySources,
  renderSerenaMemories,
} from "./serena-memory-generator.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const memoryRoot = join(repositoryRoot, ".serena", "memories");
const memories = renderSerenaMemories(loadSerenaMemorySources(repositoryRoot));

for (const [relativePath, contents] of memories) {
  const targetPath = join(memoryRoot, ...relativePath.split("/"));
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, contents, "utf8");
}

console.log(`Generated ${memories.size} reviewed Serena memories.`);
