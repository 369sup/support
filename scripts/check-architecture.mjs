import { resolve } from "node:path";

import { runArchitectureChecks } from "./architecture-checker.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const applicationRoot = resolve(repositoryRoot, "apps", "web");
const errors = runArchitectureChecks({ applicationRoot, repositoryRoot });

if (errors.length > 0) {
  console.error("Architecture check failed:");

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log("Architecture check passed.");
}
