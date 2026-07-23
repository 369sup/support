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
  activateMemory,
  distillMemory,
  memoryStatus,
  startMemorySession,
  stopMemorySession,
  validateMemory,
} from "./engine.mjs";
import {
  candidateBundleEnd,
  candidateBundleStart,
} from "./schema.mjs";

async function repositoryFixture() {
  const root = await mkdtemp(join(tmpdir(), "support-memory-engine-"));
  await mkdir(join(root, ".serena", "memories", "local"), {
    recursive: true,
  });
  return root;
}

function candidate(overrides = {}) {
  return {
    authority: "user-decision",
    confidence: 1,
    durability: "durable",
    evidence: [
      {
        reference: "approved-task-plan",
        type: "user-instruction",
      },
    ],
    invalidatedBy: ["The decision is explicitly replaced."],
    kind: "decision",
    scope: "repository",
    statement: "Use deterministic local-memory consolidation.",
    status: "confirmed",
    subject: "Memory consolidation",
    ...overrides,
  };
}

async function writeCurrentTask(root, token, candidates, disposition = "distill") {
  const bundle = {
    candidates,
    checkpointToken: token,
    disposition,
    schemaVersion: 1,
  };
  const contents = [
    "# Current task",
    "",
    "## Objective",
    "",
    "Exercise the managed-memory lifecycle.",
    "",
    candidateBundleStart,
    "```json",
    JSON.stringify(bundle, null, 2),
    "```",
    candidateBundleEnd,
  ].join("\n");
  await writeFile(
    join(root, ".serena", "memories", "local", "current-task.md"),
    contents,
    "utf8",
  );
}

async function allFileContents(directory) {
  const results = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await allFileContents(path)));
    } else if (entry.isFile()) {
      results.push(await readFile(path, "utf8"));
    }
  }

  return results;
}

test("runs current-task through episode, distillation, durable memory, and index", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, {
    sessionId: "session-1",
  });
  await writeCurrentTask(root, session.checkpointToken, [candidate()]);
  const stopped = await stopMemorySession(root, {
    sessionId: "session-1",
  });

  assert.equal(stopped.action, "complete");
  const durablePath = join(
    root,
    ".serena",
    "memories",
    "local",
    "durable",
    "decision",
    "repository--memory-consolidation.md",
  );
  assert.match(await readFile(durablePath, "utf8"), /deterministic local-memory/);
  assert.match(
    await readFile(
      join(root, ".serena", "memories", "local", "index.md"),
      "utf8",
    ),
    /mem:local\/durable\/decision\/repository--memory-consolidation/,
  );
  assert.deepEqual(await validateMemory(root), []);

  const second = await distillMemory(root);
  assert.equal(second.processed, 0);
  assert.equal(second.entries, 1);
});

test("deduplicates equivalent candidates and records authority conflicts", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, {
    sessionId: "session-conflict",
  });
  await writeCurrentTask(root, session.checkpointToken, [candidate()]);
  await stopMemorySession(root, { sessionId: "session-conflict" });

  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "inference",
      statement: "Use model-directed local-memory consolidation.",
    }),
  ]);
  await stopMemorySession(root, { sessionId: "session-conflict" });
  const status = await memoryStatus(root);

  assert.equal(status.entries, 1);
  assert.equal(status.conflicts, 1);
  assert.match(
    await readFile(
      join(root, ".serena", "memories", "local", "unresolved.md"),
      "utf8",
    ),
    /retained-higher-authority/,
  );
});

test("supersedes lower authority and archives the previous value", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, {
    sessionId: "session-supersede",
  });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "inference",
      statement: "Use inferred memory behavior.",
    }),
  ]);
  await stopMemorySession(root, { sessionId: "session-supersede" });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      statement: "Use explicitly approved memory behavior.",
    }),
  ]);
  await stopMemorySession(root, { sessionId: "session-supersede" });

  const archiveContents = await allFileContents(
    join(root, ".serena", "memories", "local", "archive"),
  );
  assert.equal(archiveContents.some((contents) => /inferred memory/.test(contents)), true);
  assert.match(
    await readFile(
      join(
        root,
        ".serena",
        "memories",
        "local",
        "durable",
        "decision",
        "repository--memory-consolidation.md",
      ),
      "utf8",
    ),
    /explicitly approved/,
  );
});

test("archives expired entries without deleting their record", async () => {
  const root = await repositoryFixture();
  const start = new Date("2026-01-01T00:00:00.000Z");
  const session = await startMemorySession(root, {
    now: start,
    sessionId: "session-expiry",
  });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "repeated-observation",
      durability: "durable",
      kind: "workflow",
      statement: "Use the current temporary workflow.",
      subject: "Temporary workflow",
    }),
  ]);
  await stopMemorySession(root, {
    now: start,
    sessionId: "session-expiry",
  });
  const activated = await activateMemory(root, {
    now: new Date("2026-05-01T00:00:00.000Z"),
  });

  assert.equal(activated.archivedEntries, 1);
  const status = await memoryStatus(root, {
    now: new Date("2026-05-01T00:00:00.000Z"),
  });
  assert.equal(status.entries, 0);
  const archiveContents = await allFileContents(
    join(root, ".serena", "memories", "local", "archive"),
  );
  assert.equal(archiveContents.some((contents) => /temporary workflow/i.test(contents)), true);
});

test("accepts no-memory disposition without durable noise", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, {
    sessionId: "session-none",
  });
  await writeCurrentTask(root, session.checkpointToken, [], "no-memory");
  const result = await stopMemorySession(root, {
    sessionId: "session-none",
  });
  const status = await memoryStatus(root);

  assert.equal(result.action, "complete");
  assert.equal(status.entries, 0);
  assert.equal(status.validationErrors.length, 0);
});

test("does not persist transcript or tool output content", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, {
    sessionId: "session-redaction",
  });
  await writeCurrentTask(root, session.checkpointToken, [candidate()]);
  await stopMemorySession(root, { sessionId: "session-redaction" });
  const contents = await allFileContents(
    join(root, ".serena", "memories", "local"),
  );

  assert.equal(contents.some((item) => item.includes("RAW_TRANSCRIPT_SENTINEL")), false);
  assert.equal(contents.some((item) => item.includes("TOOL_OUTPUT_SENTINEL")), false);
});

test("rejects a corrupt manifest without replacing it", async () => {
  const root = await repositoryFixture();
  const stateRoot = join(root, ".serena", "memories", "local", "_state");
  await mkdir(stateRoot, { recursive: true });
  const manifestPath = join(stateRoot, "manifest.json");
  await writeFile(manifestPath, "{broken", "utf8");

  await assert.rejects(() => activateMemory(root), /Managed JSON file is invalid/);
  assert.equal(await readFile(manifestPath, "utf8"), "{broken");
});

test("serializes concurrent session initialization through the memory lock", async () => {
  const root = await repositoryFixture();
  const sessions = await Promise.all([
    startMemorySession(root, { sessionId: "same-session" }),
    startMemorySession(root, { sessionId: "same-session" }),
    startMemorySession(root, { sessionId: "same-session" }),
  ]);

  assert.equal(new Set(sessions.map((item) => item.checkpointToken)).size, 1);
});

