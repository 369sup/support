import { resolve } from "node:path";

import {
  activateMemory,
  applyMemoryMigration,
  checkpointMemory,
  distillMemory,
  maintainMemory,
  memoryStatus,
  prepareMemoryMigration,
  validateMemory,
} from "./engine.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..", "..");

function parseArguments(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];

    if (argument === "--json") {
      options.json = true;
      continue;
    }

    if (argument === "--apply") {
      options.apply = true;
      continue;
    }

    if (argument === "--session") {
      const sessionId = rest[index + 1];

      if (sessionId === undefined) {
        throw new Error("--session requires a value.");
      }

      options.sessionId = sessionId;
      index += 1;
      continue;
    }

    throw new Error(`Unsupported argument: ${argument}`);
  }

  return { command, options };
}

function output(value, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(value)}\n`);
    return;
  }

  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function runCommand(command, options) {
  switch (command) {
    case "activate":
      return activateMemory(repositoryRoot);
    case "checkpoint":
      if (options.sessionId === undefined) {
        throw new Error("memory:checkpoint requires --session <session-id>.");
      }
      return checkpointMemory(repositoryRoot, {
        sessionId: options.sessionId,
      });
    case "distill":
      return distillMemory(repositoryRoot);
    case "maintain":
      return maintainMemory(repositoryRoot);
    case "migrate":
      return options.apply
        ? applyMemoryMigration(repositoryRoot)
        : prepareMemoryMigration(repositoryRoot);
    case "status":
      return memoryStatus(repositoryRoot);
    case "validate": {
      const errors = await validateMemory(repositoryRoot);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return { valid: true };
    }
    default:
      throw new Error(
        "Usage: node scripts/memory/cli.mjs <activate|checkpoint|distill|maintain|migrate|status|validate> [--apply] [--session <id>] [--json]",
      );
  }
}

try {
  const { command, options } = parseArguments(process.argv.slice(2));
  output(await runCommand(command, options), options.json);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown memory CLI error.";
  process.stderr.write(`[serena-memory] ${message}\n`);
  process.exitCode = 1;
}
