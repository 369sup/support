"use strict";

const fs = require("node:fs");
const path = require("node:path");

const READINESS_CONTEXT = [
  "For coding-project work where symbol identity can affect the result, use Serena JetBrains as the primary code-aware interface.",
  "Before repository work: activate the exact project root, load Serena instructions once, inspect current config, confirm the same root is open and indexed in JetBrains, then run one real jet_brains_* semantic read against an existing relevant file.",
  "Only that semantic smoke call can establish READY. If it fails, classify Serena as DEGRADED or UNAVAILABLE, report the exact boundary, and use the narrowest text/file fallback without repeated retries.",
  "Codex owns the stdio server lifecycle; do not daemonize, manually stop, or start a second Serena server.",
].join(" ");

const PROMPT_CONTEXT = [
  "Classify this request before acting.",
  "For symbol-sensitive coding work, follow the Serena JetBrains readiness sequence and prefer semantic declarations, references, implementations, inspections, and refactorings.",
  "For prose, configuration, generated content, or non-symbol work, use the narrower native file/text tool instead.",
].join(" ");

function safeId(value) {
  return String(value || "unknown").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function statePath(input, dataDirectory) {
  if (!dataDirectory || !input.session_id || !input.turn_id) {
    return null;
  }

  return path.join(
    dataDirectory,
    "lifecycle-state",
    `${safeId(input.session_id)}--${safeId(input.turn_id)}.json`,
  );
}

function readState(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {
      mutationObserved: false,
      semanticAttempted: false,
      semanticFailed: false,
      semanticSucceeded: false,
    };
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {
      mutationObserved: false,
      semanticAttempted: false,
      semanticFailed: false,
      semanticSucceeded: false,
    };
  }
}

function writeState(filePath, state) {
  if (!filePath) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state)}\n`, "utf8");
}

function responseFailed(value) {
  if (typeof value === "string") {
    return /Error executing tool|No file found|APIError|PluginServerError|isError["']?\s*:\s*true/i.test(
      value.slice(0, 200000),
    );
  }

  if (Array.isArray(value)) {
    return value.some(responseFailed);
  }

  if (value && typeof value === "object") {
    if (value.isError === true) {
      return true;
    }

    return Object.values(value).some(responseFailed);
  }

  return false;
}

function additionalContext(eventName, content) {
  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: content,
    },
  };
}

function handlePostToolUse(input, dataDirectory) {
  const filePath = statePath(input, dataDirectory);
  const state = readState(filePath);
  const toolName = String(input.tool_name || "");

  if (/^mcp__serena__jet_brains_/.test(toolName)) {
    const failed = responseFailed(input.tool_response);
    state.semanticAttempted = true;
    state.semanticFailed = failed;
    state.semanticSucceeded = !failed;
  }

  if (/^(apply_patch|Edit|Write)$/.test(toolName)) {
    state.mutationObserved = true;
  }

  writeState(filePath, state);

  if (state.semanticFailed) {
    return additionalContext(
      "PostToolUse",
      "The JetBrains semantic operation failed. Treat the integration as DEGRADED, report the exact failed boundary, use the narrowest fallback, and do not treat configuration or tool availability as semantic verification.",
    );
  }

  return {};
}

function handleStop(input, dataDirectory) {
  const filePath = statePath(input, dataDirectory);
  const state = readState(filePath);
  const relevantTurn = state.mutationObserved || state.semanticAttempted;

  if (!relevantTurn) {
    return {};
  }

  if (input.stop_hook_active) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return {};
  }

  let semanticStatus =
    "No semantic attempt was recorded; run one if symbol identity affected the work, otherwise report why it was not applicable.";
  if (state.semanticAttempted && state.semanticFailed) {
    semanticStatus = "The semantic attempt failed, so report DEGRADED.";
  } else if (state.semanticSucceeded) {
    semanticStatus =
      "A semantic attempt completed; report READY only if its result was usable.";
  }

  return {
    decision: "block",
    reason: [
      "Complete one Serena lifecycle pass before finishing.",
      semanticStatus,
      "Review semantic/reference integrity where relevant, inspect the actual diff, and run the smallest discriminating check.",
      "Evaluate durable memory explicitly. Write Serena memory only for verified, stable, non-obvious project facts that avoid expensive rediscovery; otherwise do not write memory. If memory changes, run `serena memories check`.",
      "Then provide the final result; the stop-active guard will prevent another continuation.",
    ].join(" "),
  };
}

function handleEvent(input, environment = process.env) {
  const eventName = input.hook_event_name;

  if (eventName === "SessionStart") {
    return additionalContext("SessionStart", READINESS_CONTEXT);
  }

  if (eventName === "UserPromptSubmit") {
    return additionalContext("UserPromptSubmit", PROMPT_CONTEXT);
  }

  if (eventName === "PostToolUse") {
    return handlePostToolUse(input, environment.PLUGIN_DATA);
  }

  if (eventName === "Stop") {
    return handleStop(input, environment.PLUGIN_DATA);
  }

  return {};
}

function run() {
  let rawInput = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    rawInput += chunk;
  });
  process.stdin.on("end", () => {
    try {
      const input = JSON.parse(rawInput || "{}");
      process.stdout.write(`${JSON.stringify(handleEvent(input))}\n`);
    } catch (error) {
      process.stderr.write(`[serena-jetbrains-lifecycle] ${error.message}\n`);
      process.exitCode = 1;
    }
  });
}

module.exports = {
  handleEvent,
  responseFailed,
  run,
};
