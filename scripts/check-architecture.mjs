import { resolve } from "node:path";

import { runArchitectureChecks } from "./architecture-checker.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const applicationRoot = resolve(repositoryRoot, "apps", "web");
const profileArgument = process.argv.find((argument) => {
  return argument.startsWith("--profile=");
});
const profile = profileArgument === undefined
  ? "required"
  : profileArgument.slice("--profile=".length);

let violations;

try {
  violations = runArchitectureChecks({
    applicationRoot,
    profile,
    repositoryRoot,
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Architecture check configuration failed: ${message}`);
  process.exitCode = 2;
}

if (violations !== undefined && violations.length > 0) {
  console.error(`Architecture ${profile} check failed:`);

  for (const violation of violations) {
    const location = violation.path === undefined ? "" : ` ${violation.path}`;
    console.error(
      `- [${violation.ruleId}] [${violation.category}]${location} ${violation.message}`,
    );
  }

  process.exitCode = 1;
} else if (violations !== undefined) {
  console.log(`Architecture ${profile} check passed.`);
}
