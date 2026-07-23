import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  activateMemory,
  applyMemoryMigration,
  distillMemory,
  memoryStatus,
  prepareMemoryMigration,
  startMemorySession,
  stopMemorySession,
  validateMemory,
} from "./engine.mjs";
import {
  candidateBundleEnd,
  candidateBundleStart,
} from "./schema.mjs";
import { sha256 } from "./policy.mjs";

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

test("previews and applies an idempotent exclusive legacy-memory migration", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const legacyNames = [
    "bounded-context-readmes",
    "memory-system-current-task-2026-07-24",
    "roadmap-current-task-2026-07-23",
    "roadmap-implementation-state",
    "serena-memory-workflow",
  ];

  for (const name of legacyNames) {
    await writeFile(join(localRoot, `${name}.md`), `# ${name}\n`, "utf8");
  }

  const preview = await prepareMemoryMigration(root, {
    now: new Date("2026-07-24T00:00:00.000Z"),
  });

  assert.equal(preview.items.length, 5);
  assert.equal(preview.ownershipMode, "legacy-compatible");
  await assert.rejects(
    readFile(join(localRoot, "_state", "ownership.json"), "utf8"),
    { code: "ENOENT" },
  );
  await writeCurrentTask(root, preview.checkpointToken, [
    candidate({
      authority: "inference",
      confidence: 0.7,
      durability: "working",
      evidence: [
        {
          reference: `legacy-inventory-sha256:${preview.inventoryHash}`,
          type: "tool-observation",
        },
      ],
      kind: "workflow",
      statement:
        "Implement remaining planned contexts in dependency waves and validate each wave before advancing.",
      subject: "Catalog roadmap sequencing",
    }),
  ]);

  const applied = await applyMemoryMigration(root, {
    now: new Date("2026-07-24T00:05:00.000Z"),
  });
  const status = await memoryStatus(root);

  assert.equal(applied.purged, 5);
  assert.equal(applied.ownershipMode, "exclusive");
  assert.equal(status.entries, 1);
  assert.equal(status.legacyMigrationTombstones, 5);
  assert.equal(status.ownershipMode, "exclusive");
  assert.equal(status.retiredLegacyFiles, 0);
  assert.equal(status.unmanagedVisible, 0);
  assert.deepEqual(status.validationErrors, []);

  for (const name of legacyNames) {
    await assert.rejects(readFile(join(localRoot, `${name}.md`), "utf8"), {
      code: "ENOENT",
    });
    await assert.rejects(
      readFile(
        join(
          localRoot,
          "archive",
          "legacy-migration",
          preview.migrationId,
          `${name}.md`,
        ),
        "utf8",
      ),
      { code: "ENOENT" },
    );
  }
  const tombstoneMetadataContents = await readFile(
    join(localRoot, "_state", "migrations", `${preview.migrationId}.json`),
    "utf8",
  );
  const tombstoneMetadata = JSON.parse(tombstoneMetadataContents);
  assert.equal(tombstoneMetadata.items.length, 5);
  assert.equal(
    tombstoneMetadata.items.every((item) => item.purgedAt !== undefined),
    true,
  );
  assert.equal(
    legacyNames.some((name) => {
      return tombstoneMetadataContents.includes(`# ${name}`);
    }),
    false,
  );

  const repeated = await applyMemoryMigration(root);
  assert.equal(repeated.alreadyComplete, true);
  assert.equal(repeated.migrationId, preview.migrationId);
});

test("upgrades a completed legacy archive to purge tombstones", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const migrationId = "a".repeat(24);
  const inventoryHash = "b".repeat(64);
  const archivedContents = "# Retired legacy memory\n";
  const archiveRelativePath =
    `archive/legacy-migration/${migrationId}/retired.md`;
  const metadataRelativePath =
    `archive/legacy-migration/${migrationId}/migration.json`;
  const item = {
    archiveRelativePath,
    contentHash: sha256(archivedContents),
    disposition: "archive-only",
    memoryName: "local/retired",
    reason: "superseded-policy",
    relativePath: "retired.md",
    size: archivedContents.length,
  };
  const migration = {
    appliedAt: "2026-07-24T00:00:00.000Z",
    inventoryHash,
    items: [item],
    metadataRelativePath,
    migrationId,
  };
  await mkdir(join(localRoot, "archive", "legacy-migration", migrationId), {
    recursive: true,
  });
  await mkdir(join(localRoot, "_state"), { recursive: true });
  await writeFile(
    join(localRoot, archiveRelativePath),
    archivedContents,
    "utf8",
  );
  await writeFile(
    join(localRoot, metadataRelativePath),
    `${JSON.stringify(
      {
        appliedAt: migration.appliedAt,
        inventoryHash,
        items: [item],
        migrationId,
        schemaVersion: 1,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    join(localRoot, "_state", "ownership.json"),
    `${JSON.stringify(
      {
        enabledAt: migration.appliedAt,
        migration,
        mode: "exclusive",
        quarantines: [],
        schemaVersion: 1,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const activated = await activateMemory(root, {
    now: new Date("2026-07-24T01:00:00.000Z"),
  });
  const ownership = JSON.parse(
    await readFile(join(localRoot, "_state", "ownership.json"), "utf8"),
  );

  assert.equal(activated.purgedLegacy, 1);
  assert.equal(ownership.migration.items[0].purgedAt !== undefined, true);
  assert.equal(
    ownership.migration.metadataRelativePath,
    `_state/migrations/${migrationId}.json`,
  );
  await assert.rejects(readFile(join(localRoot, archiveRelativePath), "utf8"), {
    code: "ENOENT",
  });
  await assert.rejects(readFile(join(localRoot, metadataRelativePath), "utf8"), {
    code: "ENOENT",
  });
  await assert.rejects(
    readdir(join(localRoot, "archive", "legacy-migration", migrationId)),
    { code: "ENOENT" },
  );
  assert.equal(
    JSON.parse(
      await readFile(
        join(localRoot, "_state", "migrations", `${migrationId}.json`),
        "utf8",
      ),
    ).items.length,
    1,
  );
});

test("refuses migration when the candidate token or inventory changed", async () => {
  const root = await repositoryFixture();
  const legacyPath = join(
    root,
    ".serena",
    "memories",
    "local",
    "roadmap-implementation-state.md",
  );
  await writeFile(legacyPath, "# Initial roadmap\n", "utf8");
  const preview = await prepareMemoryMigration(root);
  await writeCurrentTask(root, preview.checkpointToken, [
    candidate({
      authority: "inference",
      durability: "working",
      kind: "workflow",
    }),
  ]);
  await writeFile(legacyPath, "# Changed roadmap\n", "utf8");

  await assert.rejects(
    applyMemoryMigration(root),
    /checkpoint token is stale or invalid/,
  );
  assert.equal(await readFile(legacyPath, "utf8"), "# Changed roadmap\n");
  await assert.rejects(
    readFile(
      join(root, ".serena", "memories", "local", "_state", "ownership.json"),
      "utf8",
    ),
    { code: "ENOENT" },
  );
});

test("refuses migration without the required distilled candidate", async () => {
  const root = await repositoryFixture();
  const legacyPath = join(
    root,
    ".serena",
    "memories",
    "local",
    "roadmap-current-task-2026-07-23.md",
  );
  await writeFile(legacyPath, "# Remaining roadmap\n", "utf8");
  const preview = await prepareMemoryMigration(root);
  await writeCurrentTask(root, preview.checkpointToken, [], "no-memory");

  await assert.rejects(
    applyMemoryMigration(root),
    /require at least one migration candidate/,
  );
  assert.equal(await readFile(legacyPath, "utf8"), "# Remaining roadmap\n");
  await assert.rejects(
    readFile(
      join(root, ".serena", "memories", "local", "_state", "ownership.json"),
      "utf8",
    ),
    { code: "ENOENT" },
  );
});

test("migration preview rejects a symlinked unmanaged memory", async (context) => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const targetPath = join(root, "outside-memory.md");
  const linkPath = join(localRoot, "legacy-link.md");
  await writeFile(targetPath, "# Outside\n", "utf8");

  try {
    await symlink(targetPath, linkPath, "file");
  } catch (error) {
    if (["EACCES", "EPERM"].includes(error?.code)) {
      context.skip("The current Windows environment cannot create symlinks.");
      return;
    }

    throw error;
  }

  await assert.rejects(prepareMemoryMigration(root), /encountered a symlink/);
});

test("keeps every legacy source when tombstone validation fails", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const legacyNames = [
    "roadmap-current-task-2026-07-23",
    "roadmap-implementation-state",
  ];

  for (const name of legacyNames) {
    await writeFile(join(localRoot, `${name}.md`), `# ${name}\n`, "utf8");
  }

  const preview = await prepareMemoryMigration(root);
  await writeCurrentTask(root, preview.checkpointToken, [
    candidate({
      authority: "inference",
      durability: "working",
      kind: "workflow",
    }),
  ]);
  const corruptTarget = join(
    localRoot,
    "_state",
    "migrations",
    `${preview.migrationId}.json`,
  );
  await mkdir(join(corruptTarget, ".."), { recursive: true });
  await writeFile(
    corruptTarget,
    `${JSON.stringify({ inventoryHash: "stale" }, null, 2)}\n`,
    "utf8",
  );

  await assert.rejects(
    applyMemoryMigration(root),
    /tombstone metadata is stale/,
  );

  for (const name of legacyNames) {
    assert.equal(
      await readFile(join(localRoot, `${name}.md`), "utf8"),
      `# ${name}\n`,
    );
  }

  await assert.rejects(
    readFile(join(localRoot, "_state", "ownership.json"), "utf8"),
    { code: "ENOENT" },
  );
});

test("exclusive activation quarantines future unmanaged memories without exposing content", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const legacyPath = join(localRoot, "roadmap-implementation-state.md");
  await writeFile(legacyPath, "# Roadmap\n", "utf8");
  const preview = await prepareMemoryMigration(root);
  await writeCurrentTask(root, preview.checkpointToken, [
    candidate({
      authority: "inference",
      durability: "working",
      kind: "workflow",
    }),
  ]);
  await applyMemoryMigration(root);

  const unknownContents = "future unmanaged private note sentinel";
  const unknownPath = join(localRoot, "future-unmanaged.md");
  await writeFile(unknownPath, unknownContents, "utf8");
  const activated = await activateMemory(root, {
    now: new Date("2026-07-24T01:00:00.000Z"),
  });
  const status = await memoryStatus(root);
  const unresolved = await readFile(
    join(localRoot, "unresolved.md"),
    "utf8",
  );

  assert.equal(activated.quarantined, 1);
  assert.equal(status.quarantined, 1);
  assert.equal(status.unmanagedVisible, 0);
  await assert.rejects(readFile(unknownPath, "utf8"), { code: "ENOENT" });
  assert.match(unresolved, /local\/future-unmanaged/);
  assert.equal(unresolved.includes(unknownContents), false);
});

test("reports tombstone metadata corruption in exclusive mode", async () => {
  const root = await repositoryFixture();
  const localRoot = join(root, ".serena", "memories", "local");
  const legacyPath = join(localRoot, "roadmap-implementation-state.md");
  await writeFile(legacyPath, "# Roadmap\n", "utf8");
  const preview = await prepareMemoryMigration(root);
  await writeCurrentTask(root, preview.checkpointToken, [
    candidate({
      authority: "inference",
      durability: "working",
      kind: "workflow",
    }),
  ]);
  await applyMemoryMigration(root);

  const ownership = JSON.parse(
    await readFile(join(localRoot, "_state", "ownership.json"), "utf8"),
  );
  await writeFile(
    join(localRoot, ownership.migration.metadataRelativePath),
    `${JSON.stringify({ inventoryHash: "stale" }, null, 2)}\n`,
    "utf8",
  );
  const errors = await validateMemory(root);

  assert.equal(
    errors.includes("Legacy migration tombstone metadata is missing or stale."),
    true,
  );
});
