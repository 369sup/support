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
  maintainMemory,
  markMemoryDirty,
  memoryStatus,
  preCompactMemory,
  startMemorySession,
  stopMemorySession,
  validateMemory,
} from "./index.mjs";
import {
  estimateTokens,
  managedMemoryName,
  memoryLimits,
  renderDurableMemory,
  renderIndex,
  renderUnresolved,
} from "./model.mjs";
import {
  candidateBundleEnd,
  candidateBundleStart,
  parseCandidateBundleFromTask,
  validateCandidateBundle,
} from "./schema.mjs";

async function repositoryFixture() {
  const root = await mkdtemp(join(tmpdir(), "support-memory-"));
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

function bundle(token, candidates = [candidate()], disposition = "distill") {
  return {
    candidates,
    checkpointToken: token,
    disposition,
    schemaVersion: 1,
  };
}

async function writeCurrentTask(
  root,
  token,
  candidates = [candidate()],
  disposition = "distill",
) {
  const contents = [
    "# Current task",
    "",
    "## Objective",
    "",
    "Exercise the managed-memory lifecycle.",
    "",
    candidateBundleStart,
    "```json",
    JSON.stringify(bundle(token, candidates, disposition), null, 2),
    "```",
    candidateBundleEnd,
  ].join("\n");
  await writeFile(
    join(root, ".serena", "memories", "local", "current-task.md"),
    contents,
    "utf8",
  );
  return contents;
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

test("runs current-task through checkpoint, distillation, rendering, and validation", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, { sessionId: "lifecycle" });
  await writeCurrentTask(root, session.checkpointToken);
  const stopped = await stopMemorySession(root, { sessionId: "lifecycle" });

  assert.equal(stopped.action, "complete");
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
    /deterministic local-memory/,
  );
  assert.deepEqual(await validateMemory(root), []);
  assert.equal((await maintainMemory(root)).processed, 0);
});

test("uses dirty and current-task hash instead of session event history", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  await writeFile(join(localRoot, "current-task.md"), "# Current task\n", "utf8");
  await startMemorySession(root, { sessionId: "hash-state" });

  assert.deepEqual(
    await preCompactMemory(root, { sessionId: "hash-state" }),
    { checkpointed: false },
  );
  await markMemoryDirty(root, {
    material: false,
    sessionId: "hash-state",
  });
  assert.equal(
    (await stopMemorySession(root, { sessionId: "hash-state" })).action,
    "complete",
  );

  await markMemoryDirty(root, {
    material: true,
    sessionId: "hash-state",
  });
  const continuation = await stopMemorySession(root, {
    sessionId: "hash-state",
  });
  assert.equal(continuation.action, "continue");
});

test("detects current-task changes even without a material tool event", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, { sessionId: "hash-change" });
  await writeCurrentTask(root, session.checkpointToken, [], "no-memory");
  const stopped = await stopMemorySession(root, { sessionId: "hash-change" });
  assert.equal(stopped.action, "complete");
});

test("retains higher authority without unresolved conflict noise", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, { sessionId: "authority" });
  await writeCurrentTask(root, session.checkpointToken);
  await stopMemorySession(root, { sessionId: "authority" });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "inference",
      statement: "Use inferred consolidation.",
    }),
  ]);
  await stopMemorySession(root, { sessionId: "authority" });

  assert.equal((await memoryStatus(root)).conflicts, 0);
  assert.doesNotMatch(
    await readFile(
      join(root, ".serena", "memories", "local", "unresolved.md"),
      "utf8",
    ),
    /retained-higher-authority/,
  );
});

test("supersedes lower authority and archives the previous value", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, { sessionId: "supersede" });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "inference",
      statement: "Use inferred memory behavior.",
    }),
  ]);
  await stopMemorySession(root, { sessionId: "supersede" });
  await writeCurrentTask(root, session.checkpointToken);
  await stopMemorySession(root, { sessionId: "supersede" });

  const archived = await allFileContents(
    join(root, ".serena", "memories", "local", "archive"),
  );
  assert.equal(archived.some((value) => /inferred memory/.test(value)), true);
});

test("archives expiry records without permanent deletion", async () => {
  const root = await repositoryFixture();
  const start = new Date("2026-01-01T00:00:00.000Z");
  const session = await startMemorySession(root, {
    now: start,
    sessionId: "expiry",
  });
  await writeCurrentTask(root, session.checkpointToken, [
    candidate({
      authority: "repeated-observation",
      kind: "workflow",
      statement: "Use the temporary workflow.",
      subject: "Temporary workflow",
    }),
  ]);
  await stopMemorySession(root, { now: start, sessionId: "expiry" });
  const activated = await activateMemory(root, {
    now: new Date("2026-05-01T00:00:00.000Z"),
  });
  assert.equal(activated.archivedEntries, 1);
  assert.equal((await memoryStatus(root)).entries, 0);
});

test("starts in exclusive mode and quarantines unknown visible memories", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const contents = "future unmanaged private note sentinel";
  await writeFile(join(localRoot, "future-unmanaged.md"), contents, "utf8");
  const activated = await activateMemory(root);
  const status = await memoryStatus(root);
  const unresolved = await readFile(join(localRoot, "unresolved.md"), "utf8");

  assert.equal(activated.ownershipMode, "exclusive");
  assert.equal(activated.quarantined, 1);
  assert.equal(status.unmanagedVisible, 0);
  assert.match(unresolved, /local\/future-unmanaged/);
  assert.equal(unresolved.includes(contents), false);
});

test("accepts no-memory disposition without durable noise", async () => {
  const root = await repositoryFixture();
  const session = await startMemorySession(root, { sessionId: "none" });
  await writeCurrentTask(root, session.checkpointToken, [], "no-memory");
  assert.equal(
    (await stopMemorySession(root, { sessionId: "none" })).action,
    "complete",
  );
  assert.equal((await memoryStatus(root)).entries, 0);
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

test("serializes concurrent session initialization", async () => {
  const root = await repositoryFixture();
  const sessions = await Promise.all([
    startMemorySession(root, { sessionId: "same-session" }),
    startMemorySession(root, { sessionId: "same-session" }),
    startMemorySession(root, { sessionId: "same-session" }),
  ]);
  assert.equal(new Set(sessions.map((item) => item.checkpointToken)).size, 1);
});

test("validates a strict bundle and rejects unknown or sensitive fields", () => {
  const root = "D:/repository";
  const valid = validateCandidateBundle(root, bundle("c".repeat(48)));
  assert.equal(valid.candidates[0].subject, "memory-consolidation");
  assert.throws(
    () =>
      validateCandidateBundle(root, {
        ...bundle("c".repeat(48)),
        unknown: true,
      }),
    /unsupported field/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(
        root,
        bundle("c".repeat(48), [
          candidate({ statement: "Authorization: Bearer secret" }),
        ]),
      ),
    /sensitive/,
  );
});

test("extracts exactly one marked candidate bundle", () => {
  const token = "c".repeat(48);
  const task = [
    "# Current task",
    candidateBundleStart,
    "```json",
    JSON.stringify(bundle(token)),
    "```",
    candidateBundleEnd,
  ].join("\n");
  assert.equal(
    parseCandidateBundleFromTask("D:/repository", task, {
      expectedCheckpointToken: token,
    }).checkpointToken,
    token,
  );
});

test("renders bounded durable, index, and unresolved views", () => {
  const entry = {
    ...candidate({ subject: "automatic-memory-verification" }),
    expiresAt: null,
    lastConfirmedAt: "2026-07-24T00:00:00.000Z",
  };
  const durable = renderDurableMemory(entry);
  const index = renderIndex([entry], { includeCurrentTask: true });
  const unresolved = renderUnresolved([]);

  assert.match(index, new RegExp(`mem:${managedMemoryName(entry)}`));
  assert.match(unresolved, /No unresolved/);
  assert.equal(
    estimateTokens(durable) <= memoryLimits.durableMemoryTokens,
    true,
  );
});

test("compresses an oversized index without truncating statements", () => {
  const entries = Array.from({ length: 100 }, (_, index) => ({
    ...candidate({ subject: `memory-${index}` }),
    expiresAt: null,
    lastConfirmedAt: "2026-07-24T00:00:00.000Z",
  }));
  const rendered = renderIndex(entries);
  assert.equal(estimateTokens(rendered) <= memoryLimits.indexTokens, true);
  assert.match(rendered, /additional managed memories/);
});
