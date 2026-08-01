import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  evaluateHook,
  parseHookInput,
} from "./memory-orchestrator.mjs";
import {
  candidateBundleEnd,
  candidateBundleStart,
} from "../../scripts/memory/schema.mjs";

async function repositoryFixture() {
  const root = await mkdtemp(join(tmpdir(), "support-memory-hook-"));
  await mkdir(join(root, ".serena", "memories", "local"), {
    recursive: true,
  });
  await mkdir(join(root, "apps", "web"), { recursive: true });
  return root;
}

function hookInput(eventName, overrides = {}) {
  return {
    cwd: overrides.cwd,
    hook_event_name: eventName,
    session_id: overrides.session_id ?? "hook-session",
    ...overrides,
  };
}

function noSerenaOutput() {
  return { available: true, context: null };
}

function tokenFrom(result) {
  const context = result.hookSpecificOutput.additionalContext;
  const match = context.match(/Current checkpoint token: ([a-f0-9]+)/);
  assert.notEqual(match, null);
  return match[1];
}

async function writeNoMemoryTask(root, token) {
  const bundle = {
    candidates: [],
    checkpointToken: token,
    disposition: "no-memory",
    schemaVersion: 1,
  };
  await writeFile(
    join(root, ".serena", "memories", "local", "current-task.md"),
    [
      "# Current task",
      "",
      "## Objective",
      "",
      "Validate the hook lifecycle.",
      "",
      candidateBundleStart,
      "```json",
      JSON.stringify(bundle, null, 2),
      "```",
      candidateBundleEnd,
    ].join("\n"),
    "utf8",
  );
}

async function allContents(directory) {
  const contents = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      contents.push(...(await allContents(path)));
    } else if (entry.isFile()) {
      contents.push(await readFile(path, "utf8"));
    }
  }

  return contents;
}

test("validates bounded hook JSON input", () => {
  assert.deepEqual(
    parseHookInput(
      JSON.stringify({
        hook_event_name: "Stop",
        session_id: "session",
      }),
    ),
    {
      hook_event_name: "Stop",
      session_id: "session",
    },
  );
  assert.throws(() => parseHookInput("[]"), /must contain/);
  assert.throws(() => parseHookInput("{"), /valid JSON/);
  assert.throws(
    () => parseHookInput("x".repeat(1_000_001)),
    /1 MB safety limit/,
  );
});

test("SessionStart injects a checkpoint token and Serena activation context", async () => {
  const root = await repositoryFixture();
  const result = await evaluateHook(
    hookInput("SessionStart", {
      cwd: join(root, "apps", "web"),
      source: "startup",
    }),
    {
      repositoryRoot: root,
      runSerenaHook: () => ({
        available: true,
        context: "Activate the exact Serena project.",
      }),
    },
  );

  assert.match(
    result.hookSpecificOutput.additionalContext,
    /Activate the exact Serena project/,
  );
  assert.match(
    result.hookSpecificOutput.additionalContext,
    /Current checkpoint token: [a-f0-9]{48}/,
  );
});

test("PostToolUse persists only dirty state and never tool metadata or output", async () => {
  const root = await repositoryFixture();
  await evaluateHook(
    hookInput("SessionStart", { cwd: root, source: "startup" }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  await evaluateHook(
    hookInput("PostToolUse", {
      cwd: root,
      tool_input: {
        command:
          "*** Begin Patch\n*** Update File: apps/web/page.tsx\n*** End Patch",
      },
      tool_name: "apply_patch",
      tool_response: {
        output: "RAW_TOOL_OUTPUT_SENTINEL",
      },
    }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  const contents = await allContents(
    join(root, ".serena", "memories", "local"),
  );

  assert.equal(
    contents.some((value) => value.includes("RAW_TOOL_OUTPUT_SENTINEL")),
    false,
  );
  assert.equal(
    contents.some((value) => value.includes("apps/web/page.tsx")),
    false,
  );
  assert.equal(contents.some((value) => value.includes('"dirty": true')), true);
});

test("Edit and Write mark dirty only after a successful tool response", async () => {
  for (const [toolName, toolResponse, expectedDirty] of [
    ["Edit", { ok: true }, true],
    ["Write", { error: "failed" }, false],
  ]) {
    const root = await repositoryFixture();
    await evaluateHook(
      hookInput("SessionStart", { cwd: root, source: "startup" }),
      { repositoryRoot: root, runSerenaHook: noSerenaOutput },
    );
    await evaluateHook(
      hookInput("PostToolUse", {
        cwd: root,
        tool_input: { file_path: "apps/web/page.tsx" },
        tool_name: toolName,
        tool_response: toolResponse,
      }),
      { repositoryRoot: root, runSerenaHook: noSerenaOutput },
    );
    const contents = await allContents(
      join(root, ".serena", "memories", "local", "_state", "sessions"),
    );
    assert.equal(
      contents.some((value) => value.includes('"dirty": true')),
      expectedDirty,
    );
  }
});

test("Stop requests one checkpoint continuation and then fails open", async () => {
  const root = await repositoryFixture();
  await evaluateHook(
    hookInput("SessionStart", { cwd: root, source: "startup" }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  await evaluateHook(
    hookInput("PostToolUse", {
      cwd: root,
      tool_input: {
        command:
          "*** Begin Patch\n*** Update File: apps/web/page.tsx\n*** End Patch",
      },
      tool_name: "apply_patch",
      tool_response: { ok: true },
    }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  const first = await evaluateHook(
    hookInput("Stop", {
      cwd: root,
      stop_hook_active: false,
    }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  const second = await evaluateHook(
    hookInput("Stop", {
      cwd: root,
      stop_hook_active: true,
    }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );

  assert.equal(first.decision, "block");
  assert.match(first.reason, /serena-memory-candidates:start/);
  assert.equal(second.continue, true);
  assert.match(second.systemMessage, /not completed/);
});

test("Stop validates and distills a no-memory checkpoint before cleanup", async () => {
  const root = await repositoryFixture();
  let cleanupCalls = 0;
  const sessionStart = await evaluateHook(
    hookInput("SessionStart", { cwd: root, source: "startup" }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  await writeNoMemoryTask(root, tokenFrom(sessionStart));
  const stopped = await evaluateHook(
    hookInput("Stop", {
      cwd: root,
      stop_hook_active: false,
    }),
    {
      repositoryRoot: root,
      runSerenaHook: (action) => {
        if (action === "cleanup") {
          cleanupCalls += 1;
        }

        return noSerenaOutput();
      },
    },
  );

  assert.deepEqual(stopped, { continue: true });
  assert.equal(cleanupCalls, 1);
});

test("PreCompact is a no-op when the clean current-task baseline is absent", async () => {
  const root = await repositoryFixture();
  await evaluateHook(
    hookInput("SessionStart", { cwd: root, source: "startup" }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );
  const result = await evaluateHook(
    hookInput("PreCompact", {
      cwd: root,
      trigger: "auto",
    }),
    { repositoryRoot: root, runSerenaHook: noSerenaOutput },
  );

  assert.equal(result, undefined);
});

test("missing Serena lifecycle helper degrades to model-visible context", async () => {
  const root = await repositoryFixture();
  const result = await evaluateHook(
    hookInput("SessionStart", { cwd: root, source: "startup" }),
    {
      repositoryRoot: root,
      runSerenaHook: () => ({
        available: false,
        context: "Serena lifecycle helper is unavailable.",
      }),
    },
  );

  assert.match(
    result.hookSpecificOutput.additionalContext,
    /helper is unavailable/,
  );
});
