import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateHook,
  extractPatchPaths,
  isArchitectureSensitivePath,
  parseHookInput,
} from "./repository-guard.mjs";

function hookInput(eventName, patch) {
  return {
    hook_event_name: eventName,
    tool_input: {
      command: patch,
    },
  };
}

test("extracts and normalizes repository paths from apply_patch input", () => {
  const patch = [
    "*** Begin Patch",
    "*** Update File: apps\\web\\src\\app\\page.tsx",
    "*** Add File: docs/architecture/example.md",
    "*** End Patch",
  ].join("\n");

  assert.deepEqual(extractPatchPaths(patch), [
    "apps/web/src/app/page.tsx",
    "docs/architecture/example.md",
  ]);
});

test("blocks direct edits to the generated module map", async () => {
  const result = await evaluateHook(
    hookInput(
      "PreToolUse",
      "*** Update File: docs/architecture/module-map.md",
    ),
  );

  assert.equal(
    result.hookSpecificOutput.permissionDecision,
    "deny",
  );
  assert.match(
    result.hookSpecificOutput.permissionDecisionReason,
    /module-map\.json/,
  );
});

test("allows edits to the module map source", async () => {
  const result = await evaluateHook(
    hookInput(
      "PreToolUse",
      "*** Update File: docs/architecture/module-map.json",
    ),
  );

  assert.equal(result, undefined);
});

test("runs architecture checks only for architecture-sensitive paths", async () => {
  let callCount = 0;
  const runArchitectureChecks = () => {
    callCount += 1;
    return [];
  };

  await evaluateHook(
    hookInput("PostToolUse", "*** Update File: README.md"),
    { runArchitectureChecks },
  );
  await evaluateHook(
    hookInput("PostToolUse", "*** Update File: apps/web/src/app/page.tsx"),
    { runArchitectureChecks },
  );

  assert.equal(callCount, 1);
  assert.equal(isArchitectureSensitivePath("apps/web/src/app/page.tsx"), true);
  assert.equal(isArchitectureSensitivePath("README.md"), false);
});

test("returns actionable PostToolUse feedback when architecture checks fail", async () => {
  const result = await evaluateHook(
    hookInput("PostToolUse", "*** Update File: apps/web/src/app/page.tsx"),
    {
      runArchitectureChecks: () => [
        "[ARCH-SRC-001] apps/web/src may contain only app and modules.",
      ],
    },
  );

  assert.equal(result.decision, "block");
  assert.match(result.reason, /ARCH-SRC-001/);
});

test("rejects malformed and oversized hook input", () => {
  assert.throws(() => parseHookInput("[]"), /JSON object/);
  assert.throws(() => parseHookInput("{"), /valid JSON/);
  assert.throws(() => parseHookInput("x".repeat(1_000_001)), /1 MB/);
});
