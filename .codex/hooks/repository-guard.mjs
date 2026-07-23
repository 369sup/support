import { readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = resolve(import.meta.dirname, "..", "..");
const applicationRoot = join(repositoryRoot, "apps", "web");
const generatedModuleMapPath = "docs/architecture/module-map.md";
const moduleMapSourcePath = "docs/architecture/module-map.json";
const exceptionRegistryPath = "docs/architecture/exceptions/registry.json";
const maximumInputLength = 1_000_000;

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRepositoryPath(candidate) {
  const trimmed = candidate.trim().replaceAll("\\", sep);
  const absolutePath = isAbsolute(trimmed)
    ? resolve(trimmed)
    : resolve(repositoryRoot, trimmed);
  const repositoryPath = relative(repositoryRoot, absolutePath);

  if (
    repositoryPath === "" ||
    repositoryPath === ".." ||
    repositoryPath.startsWith(`..${sep}`) ||
    repositoryPath.startsWith("../") ||
    isAbsolute(repositoryPath)
  ) {
    return null;
  }

  return repositoryPath.replaceAll(sep, "/");
}

export function extractPatchPaths(command) {
  if (typeof command !== "string") {
    return [];
  }

  const paths = [];
  const fileHeaderPattern = /^\*\*\* (?:Add|Update|Delete) File: (.+?)\r?$/gm;

  for (const match of command.matchAll(fileHeaderPattern)) {
    const repositoryPath = normalizeRepositoryPath(match[1]);

    if (repositoryPath !== null) {
      paths.push(repositoryPath);
    }
  }

  return [...new Set(paths)];
}

function touchedPaths(input) {
  if (!isRecord(input.tool_input)) {
    return [];
  }

  return extractPatchPaths(input.tool_input.command);
}

export function isArchitectureSensitivePath(repositoryPath) {
  if (
    repositoryPath === moduleMapSourcePath ||
    repositoryPath === exceptionRegistryPath ||
    repositoryPath === "scripts/architecture-checker.mjs" ||
    repositoryPath === "scripts/check-architecture.mjs"
  ) {
    return true;
  }

  return (
    repositoryPath.startsWith("apps/web/src/") &&
    /\.(?:ts|tsx)$/.test(repositoryPath)
  );
}

function denyGeneratedModuleMapEdit() {
  const reason =
    "Do not edit docs/architecture/module-map.md directly. Update " +
    "docs/architecture/module-map.json, then run pnpm architecture:docs.";

  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
}

async function runRepositoryArchitectureChecks() {
  const checkerUrl = pathToFileURL(
    join(repositoryRoot, "scripts", "architecture-checker.mjs"),
  ).href;
  const checker = await import(checkerUrl);

  if (typeof checker.runArchitectureChecks !== "function") {
    throw new Error("scripts/architecture-checker.mjs has no runArchitectureChecks export.");
  }

  return checker.runArchitectureChecks({ applicationRoot, repositoryRoot });
}

function architectureFailure(errors) {
  const details = errors.map((error) => `- ${error}`).join("\n");
  const reason =
    `Repository architecture checks failed after the edit:\n${details}\n` +
    "Correct the source or run pnpm architecture:docs when the module map is stale.";

  return {
    decision: "block",
    reason,
  };
}

export async function evaluateHook(input, dependencies = {}) {
  if (!isRecord(input) || typeof input.hook_event_name !== "string") {
    throw new Error("Hook input must be an object with hook_event_name.");
  }

  const paths = touchedPaths(input);

  if (input.hook_event_name === "PreToolUse") {
    return paths.includes(generatedModuleMapPath)
      ? denyGeneratedModuleMapEdit()
      : undefined;
  }

  if (input.hook_event_name !== "PostToolUse") {
    return undefined;
  }

  if (!paths.some(isArchitectureSensitivePath)) {
    return undefined;
  }

  const runChecks =
    dependencies.runArchitectureChecks ?? runRepositoryArchitectureChecks;
  const errors = await runChecks();

  if (!Array.isArray(errors)) {
    throw new Error("Architecture checker must return an array of errors.");
  }

  return errors.length > 0 ? architectureFailure(errors) : undefined;
}

export function parseHookInput(rawInput) {
  if (rawInput.length > maximumInputLength) {
    throw new Error("Hook input exceeds the 1 MB safety limit.");
  }

  let input;

  try {
    input = JSON.parse(rawInput);
  } catch {
    throw new Error("Hook input is not valid JSON.");
  }

  if (!isRecord(input)) {
    throw new Error("Hook input must be a JSON object.");
  }

  return input;
}

export async function run() {
  try {
    const rawInput = readFileSync(0, "utf8");
    const result = await evaluateHook(parseHookInput(rawInput));

    if (result !== undefined) {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown hook failure.";
    process.stderr.write(`[repository-guard] ${message}\n`);
    process.exitCode = 2;
  }
}

const entryPath = process.argv[1];

if (
  typeof entryPath === "string" &&
  import.meta.url === pathToFileURL(resolve(entryPath)).href
) {
  await run();
}
