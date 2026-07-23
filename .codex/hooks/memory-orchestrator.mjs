import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import {
  markMemoryDirty,
  preCompactMemory,
  startMemorySession,
  stopMemorySession,
} from "../../scripts/memory/index.mjs";
import { containsSensitiveValue, memoryLimits } from "../../scripts/memory/model.mjs";

const defaultRepositoryRoot = resolve(import.meta.dirname, "..", "..");

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInsideRepository(repositoryRoot, candidate) {
  if (typeof candidate !== "string" || candidate.trim() === "") {
    return false;
  }

  const absolute = isAbsolute(candidate)
    ? resolve(candidate)
    : resolve(repositoryRoot, candidate);
  const repositoryPath = relative(repositoryRoot, absolute);

  return (
    repositoryPath === "" ||
    (!isAbsolute(repositoryPath) &&
      repositoryPath !== ".." &&
      !repositoryPath.startsWith(`..${sep}`) &&
      !repositoryPath.startsWith("../"))
  );
}

export function parseHookInput(rawInput) {
  if (rawInput.length > memoryLimits.hookInputCharacters) {
    throw new Error("Hook input exceeds the 1 MB safety limit.");
  }

  let input;

  try {
    input = JSON.parse(rawInput);
  } catch {
    throw new Error("Hook input is not valid JSON.");
  }

  if (
    !isRecord(input) ||
    typeof input.hook_event_name !== "string" ||
    typeof input.session_id !== "string"
  ) {
    throw new Error(
      "Hook input must contain hook_event_name and session_id strings.",
    );
  }

  return input;
}

function boundedContext(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (
    trimmed === "" ||
    trimmed.length > 8_000 ||
    containsSensitiveValue(trimmed)
  ) {
    return null;
  }

  return trimmed;
}

function parseSerenaHookOutput(stdout) {
  const text = boundedContext(stdout);

  if (text === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);

    if (!isRecord(parsed)) {
      return null;
    }

    return (
      boundedContext(parsed.hookSpecificOutput?.additionalContext) ??
      boundedContext(parsed.systemMessage)
    );
  } catch {
    return text;
  }
}

export function runSerenaHook(action, input) {
  const result = spawnSync("serena-hooks", [action, "--client=codex"], {
    encoding: "utf8",
    input: `${JSON.stringify(input)}\n`,
    timeout: 5_000,
    windowsHide: true,
  });

  if (result.error?.code === "ENOENT") {
    return {
      available: false,
      context: "Serena lifecycle helper is unavailable; repository memory automation will continue without its reminder.",
    };
  }

  if (result.error !== undefined || result.status !== 0) {
    return {
      available: false,
      context: `Serena ${action} lifecycle helper did not complete successfully.`,
    };
  }

  return {
    available: true,
    context: parseSerenaHookOutput(result.stdout),
  };
}

function sessionStartContext(checkpointToken, serenaContext) {
  const lines = [];

  if (serenaContext !== null) {
    lines.push(serenaContext, "");
  }

  lines.push(
    "Automatic Serena memory is active for this repository.",
    `Current checkpoint token: ${checkpointToken}`,
    "For a multi-step or material task, maintain `mem:local/current-task` and include exactly one marked JSON candidate bundle using this token.",
    "The tracked model instructions define the candidate schema. Store only verified distilled facts; never store transcripts, tool output, secrets, payloads, or chain-of-thought.",
  );

  return lines.join("\n");
}

function continuationReason(checkpointToken, checkpointError) {
  return [
    "Complete the automatic Serena memory checkpoint before stopping.",
    `Checkpoint validation failed: ${checkpointError}`,
    "Update `mem:local/current-task` with the required task sections and exactly one bundle using these markers:",
    "<!-- serena-memory-candidates:start -->",
    "```json",
    JSON.stringify(
      {
        candidates: [],
        checkpointToken,
        disposition: "no-memory",
        schemaVersion: 1,
      },
      null,
      2,
    ),
    "```",
    "<!-- serena-memory-candidates:end -->",
    "Use disposition `distill` and schema-valid candidates only when the task established durable verified knowledge. Do not include raw transcript, prompts, tool output, logs, source excerpts, secrets, credentials, payloads, or chain-of-thought. After updating the memory, finish the response normally; the next Stop hook will validate and distill it.",
  ].join("\n");
}

function toolSucceeded(input) {
  const response = input.tool_response;

  if (!isRecord(response)) {
    return response !== null && response !== undefined;
  }

  if (response.error !== undefined) {
    return false;
  }

  if (
    typeof response.exit_code === "number" &&
    response.exit_code !== 0
  ) {
    return false;
  }

  return true;
}

function isMaterialTool(input) {
  const toolName = input.tool_name;

  if (["Edit", "Write", "apply_patch"].includes(toolName)) {
    return true;
  }

  if (
    typeof toolName === "string" &&
    /(?:write|edit|rename|delete)_memory$/i.test(toolName)
  ) {
    return true;
  }

  if (toolName !== "Bash" || typeof input.tool_input?.command !== "string") {
    return false;
  }

  return /\b(?:serena:memories|architecture:docs|git\s+(?:add|commit|restore|mv|rm)|Set-Content|Out-File|Move-Item|Remove-Item|Copy-Item)\b/i.test(
    input.tool_input.command,
  );
}

function additionalContext(eventName, context) {
  return {
    hookSpecificOutput: {
      additionalContext: context,
      hookEventName: eventName,
    },
  };
}

export async function evaluateHook(input, dependencies = {}) {
  const repositoryRoot = dependencies.repositoryRoot ?? defaultRepositoryRoot;
  const callSerenaHook = dependencies.runSerenaHook ?? runSerenaHook;
  const now = dependencies.now ?? new Date();

  if (!isInsideRepository(repositoryRoot, input.cwd ?? repositoryRoot)) {
    return undefined;
  }

  switch (input.hook_event_name) {
    case "SessionStart": {
      const session = await startMemorySession(repositoryRoot, {
        now,
        sessionId: input.session_id,
        source: input.source,
      });
      const serena = callSerenaHook("activate", input);
      return additionalContext(
        "SessionStart",
        sessionStartContext(session.checkpointToken, serena.context),
      );
    }
    case "PreToolUse": {
      if (input.tool_name !== "Bash") {
        return undefined;
      }

      const serena = callSerenaHook("remind", input);
      return serena.context === null
        ? undefined
        : additionalContext("PreToolUse", serena.context);
    }
    case "PostToolUse": {
      await markMemoryDirty(repositoryRoot, {
        material: toolSucceeded(input) && isMaterialTool(input),
        now,
        sessionId: input.session_id,
      });
      return undefined;
    }
    case "PreCompact": {
      const result = await preCompactMemory(repositoryRoot, {
        now,
        sessionId: input.session_id,
      });
      return result.warning === undefined
        ? undefined
        : {
            systemMessage: `Serena memory checkpoint warning: ${result.warning}`,
          };
    }
    case "Stop": {
      const result = await stopMemorySession(repositoryRoot, {
        now,
        sessionId: input.session_id,
        stopHookActive: input.stop_hook_active === true,
      });

      if (result.action === "continue") {
        return {
          decision: "block",
          reason: continuationReason(
            result.checkpointToken,
            result.checkpointError,
          ),
        };
      }

      const serena = callSerenaHook("cleanup", input);
      const systemMessage =
        result.action === "fail-open"
          ? [result.warning, serena.context].filter(Boolean).join("\n")
          : serena.context;

      return systemMessage === null || systemMessage === ""
        ? { continue: true }
        : { continue: true, systemMessage };
    }
    default:
      return undefined;
  }
}

function failOpenOutput(eventName, message) {
  if (eventName === "SessionStart") {
    return additionalContext(
      "SessionStart",
      `Serena memory automation warning: ${message}`,
    );
  }

  if (eventName === "PreToolUse" || eventName === "PostToolUse") {
    return { systemMessage: `Serena memory automation warning: ${message}` };
  }

  return {
    continue: true,
    systemMessage: `Serena memory automation warning: ${message}`,
  };
}

export async function run() {
  let input;

  try {
    input = parseHookInput(readFileSync(0, "utf8"));
    const result = await evaluateHook(input);

    if (result !== undefined) {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } else if (input.hook_event_name === "Stop") {
      process.stdout.write('{"continue":true}\n');
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown memory hook failure.";
    const output = failOpenOutput(input?.hook_event_name, message);
    process.stdout.write(`${JSON.stringify(output)}\n`);
  }
}

const entryPath = process.argv[1];

if (
  typeof entryPath === "string" &&
  import.meta.url === pathToFileURL(resolve(entryPath)).href
) {
  await run();
}
