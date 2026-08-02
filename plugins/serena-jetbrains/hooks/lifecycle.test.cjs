"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { handleEvent, responseFailed } = require("./lifecycle.cjs");

function withPluginData(runTest) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "serena-lifecycle-"));
  try {
    runTest(directory);
  } finally {
    const resolvedDirectory = path.resolve(directory);
    const resolvedTemp = path.resolve(os.tmpdir());
    assert.equal(resolvedDirectory.startsWith(resolvedTemp), true);
    fs.rmSync(resolvedDirectory, { recursive: true, force: true });
  }
}

test("SessionStart injects the readiness contract", () => {
  const result = handleEvent({ hook_event_name: "SessionStart" });
  assert.match(result.hookSpecificOutput.additionalContext, /semantic smoke call/);
  assert.match(result.hookSpecificOutput.additionalContext, /READY/);
});

test("UserPromptSubmit routes only symbol-sensitive work through Serena", () => {
  const result = handleEvent({ hook_event_name: "UserPromptSubmit" });
  assert.match(result.hookSpecificOutput.additionalContext, /symbol-sensitive/);
  assert.match(result.hookSpecificOutput.additionalContext, /prose, configuration/);
});

test("responseFailed recognizes structured and nested MCP failures", () => {
  assert.equal(responseFailed({ isError: true }), true);
  assert.equal(responseFailed({ content: [{ text: "No file found for matcher" }] }), true);
  assert.equal(responseFailed({ isError: false, content: [{ text: "ok" }] }), false);
});

test("a failed semantic call records DEGRADED evidence and gates Stop once", () => {
  withPluginData((pluginData) => {
    const baseInput = {
      session_id: "session-1",
      turn_id: "turn-1",
    };
    const postResult = handleEvent(
      {
        ...baseInput,
        hook_event_name: "PostToolUse",
        tool_name: "mcp__serena__jet_brains_get_symbols_overview",
        tool_response: { isError: true, content: [{ text: "No file found" }] },
      },
      { PLUGIN_DATA: pluginData },
    );
    assert.match(postResult.hookSpecificOutput.additionalContext, /DEGRADED/);

    const firstStop = handleEvent(
      { ...baseInput, hook_event_name: "Stop", stop_hook_active: false },
      { PLUGIN_DATA: pluginData },
    );
    assert.equal(firstStop.decision, "block");
    assert.match(firstStop.reason, /durable memory/);
    assert.match(firstStop.reason, /report DEGRADED/);

    const secondStop = handleEvent(
      { ...baseInput, hook_event_name: "Stop", stop_hook_active: true },
      { PLUGIN_DATA: pluginData },
    );
    assert.deepEqual(secondStop, {});
  });
});

test("a later successful semantic call can recover the turn to READY", () => {
  withPluginData((pluginData) => {
    const baseInput = {
      session_id: "session-recovered",
      turn_id: "turn-recovered",
      hook_event_name: "PostToolUse",
      tool_name: "mcp__serena__jet_brains_find_symbol",
    };
    handleEvent(
      { ...baseInput, tool_response: { isError: true } },
      { PLUGIN_DATA: pluginData },
    );
    handleEvent(
      { ...baseInput, tool_response: { isError: false, content: [{ text: "symbol" }] } },
      { PLUGIN_DATA: pluginData },
    );

    const stopResult = handleEvent(
      {
        ...baseInput,
        hook_event_name: "Stop",
        stop_hook_active: false,
      },
      { PLUGIN_DATA: pluginData },
    );
    assert.match(stopResult.reason, /report READY only if its result was usable/);
    assert.doesNotMatch(stopResult.reason, /report DEGRADED/);
  });
});

test("an unrelated turn is not continued by Stop", () => {
  withPluginData((pluginData) => {
    const result = handleEvent(
      {
        hook_event_name: "Stop",
        session_id: "session-2",
        turn_id: "turn-2",
        stop_hook_active: false,
      },
      { PLUGIN_DATA: pluginData },
    );
    assert.deepEqual(result, {});
  });
});
