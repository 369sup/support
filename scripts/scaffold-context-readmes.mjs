import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

import { renderContextReadme } from "./architecture-checker.mjs";

const rootDir = resolve(import.meta.dirname, "..");
const catalogPath = join(rootDir, "docs", "architecture", "module-map.json");
const modulesRoot = join(rootDir, "apps", "web", "src", "modules");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
let created = 0;
let preserved = 0;

for (const context of catalog.contexts) {
  const contextRoot = join(modulesRoot, context.subdomain, context.name);
  const readmePath = join(contextRoot, "README.md");

  if (existsSync(readmePath)) {
    preserved += 1;
    continue;
  }

  mkdirSync(contextRoot, { recursive: true });
  writeFileSync(readmePath, renderContextReadme(context), "utf8");
  created += 1;
}

console.log(
  `Scaffolded ${created} context READMEs; preserved ${preserved} existing READMEs.`,
);
