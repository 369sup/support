import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { renderModuleMap } from "./architecture-checker.mjs";

const rootDir = resolve(import.meta.dirname, "..");
const catalogPath = join(rootDir, "docs", "architecture", "module-map.json");
const markdownPath = join(rootDir, "docs", "architecture", "module-map.md");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

writeFileSync(markdownPath, renderModuleMap(catalog), "utf8");
console.log("Generated docs/architecture/module-map.md.");
