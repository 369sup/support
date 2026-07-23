import { randomBytes } from "node:crypto";
import { basename, dirname, isAbsolute, join, relative } from "node:path";

import {
  authorityRank,
  candidateContentHash,
  candidateId,
  candidateIdentity,
  expirationFor,
  managedMemoryName,
  memorySchemaVersion,
  memoryTtlDays,
  sha256,
} from "./policy.mjs";
import {
  parseCandidateBundleFromTask,
  validateCandidateBundle,
} from "./schema.mjs";
import {
  appendJsonLine,
  atomicWriteJson,
  atomicWriteText,
  fileModifiedAt,
  listRegularFiles,
  memoryPaths,
  moveManagedFile,
  readJsonIfExists,
  readTextIfExists,
  removeEmptyManagedDirectory,
  removeManagedFile,
  withMemoryLock,
} from "./storage.mjs";
import {
  renderDurableMemory,
  renderIndex,
  renderUnresolved,
} from "./render.mjs";

const managedFileHeader =
  "<!-- Managed by scripts/memory. Do not edit this rendered view directly. -->";
const ownershipSchemaVersion = 1;
const migrationSchemaVersion = 1;
const legacyMigrationPolicies = Object.freeze({
  "local/bounded-context-readmes": {
    disposition: "archive-only",
    reason: "stale-canonical-duplicate",
  },
  "local/memory-system-current-task-2026-07-24": {
    disposition: "archive-only",
    reason: "completed-task-snapshot",
  },
  "local/roadmap-current-task-2026-07-23": {
    disposition: "distill",
    reason: "unfinished-roadmap-workflow",
  },
  "local/roadmap-implementation-state": {
    disposition: "distill",
    reason: "unfinished-roadmap-workflow",
  },
  "local/serena-memory-workflow": {
    disposition: "archive-only",
    reason: "superseded-policy",
  },
});

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeLocalRelativePath(value) {
  if (
    typeof value !== "string" ||
    value === "" ||
    isAbsolute(value) ||
    value.includes("\\")
  ) {
    return false;
  }

  const segments = value.split("/");
  return (
    !segments.includes("") &&
    !segments.includes(".") &&
    !segments.includes("..")
  );
}

function isInventoryItem(value) {
  return (
    isRecord(value) &&
    typeof value.memoryName === "string" &&
    value.memoryName.startsWith("local/") &&
    /^[a-f0-9]{64}$/.test(value.contentHash) &&
    isSafeLocalRelativePath(value.relativePath) &&
    Number.isSafeInteger(value.size) &&
    value.size >= 0 &&
    ["archive-only", "distill"].includes(value.disposition) &&
    typeof value.reason === "string"
  );
}

function isArchivedRecord(value) {
  return (
    isInventoryItem(value) &&
    isSafeLocalRelativePath(value.archiveRelativePath) &&
    value.archiveRelativePath.startsWith("archive/")
  );
}

function isPurgedMigrationRecord(value) {
  return (
    isInventoryItem(value) &&
    typeof value.purgedAt === "string" &&
    (value.retiredArchiveRelativePath === undefined ||
      (isSafeLocalRelativePath(value.retiredArchiveRelativePath) &&
        value.retiredArchiveRelativePath.startsWith(
          "archive/legacy-migration/",
        )))
  );
}

function sessionHash(sessionId) {
  if (
    typeof sessionId !== "string" ||
    sessionId.trim() === "" ||
    sessionId.length > 256
  ) {
    throw new Error("Session id must be a non-empty string of at most 256 characters.");
  }

  return sha256(sessionId).slice(0, 24);
}

function sessionStatePath(paths, sessionId) {
  return join(paths.sessionsRoot, `${sessionHash(sessionId)}.json`);
}

function emptyManifest(now) {
  return {
    conflicts: [],
    entries: {},
    processedEpisodes: {},
    schemaVersion: memorySchemaVersion,
    updatedAt: now.toISOString(),
  };
}

function validateManifest(value) {
  if (!isRecord(value)) {
    throw new Error("Memory manifest must be a JSON object.");
  }

  if (value.schemaVersion !== memorySchemaVersion) {
    throw new Error(
      `Memory manifest schemaVersion must be ${memorySchemaVersion}.`,
    );
  }

  if (
    !isRecord(value.entries) ||
    !isRecord(value.processedEpisodes) ||
    !Array.isArray(value.conflicts)
  ) {
    throw new Error("Memory manifest has an invalid collection shape.");
  }

  for (const [identity, entry] of Object.entries(value.entries)) {
    if (!isRecord(entry) || entry.identity !== identity) {
      throw new Error(`Memory manifest entry "${identity}" is invalid.`);
    }
  }

  return value;
}

async function loadManifest(paths, now) {
  const stored = await readJsonIfExists(
    paths.repositoryRoot,
    paths.manifestPath,
  );
  return stored === null ? emptyManifest(now) : validateManifest(stored);
}

async function saveManifest(paths, manifest, now) {
  manifest.updatedAt = now.toISOString();
  await atomicWriteJson(paths.repositoryRoot, paths.manifestPath, manifest);
}

function emptyOwnershipState() {
  return {
    enabledAt: null,
    migration: null,
    mode: "legacy-compatible",
    quarantines: [],
    schemaVersion: ownershipSchemaVersion,
  };
}

function validateOwnershipState(value) {
  if (!isRecord(value)) {
    throw new Error("Memory ownership state must be a JSON object.");
  }

  if (
    value.schemaVersion !== ownershipSchemaVersion ||
    !["legacy-compatible", "exclusive"].includes(value.mode) ||
    !Array.isArray(value.quarantines)
  ) {
    throw new Error("Memory ownership state has an invalid shape.");
  }

  if (
    value.mode === "exclusive" &&
    (!isRecord(value.migration) ||
      typeof value.enabledAt !== "string" ||
      !/^[a-f0-9]{64}$/.test(value.migration.inventoryHash) ||
      typeof value.migration.migrationId !== "string" ||
      !isSafeLocalRelativePath(value.migration.metadataRelativePath) ||
      !(
        value.migration.metadataRelativePath.startsWith(
          "archive/legacy-migration/",
        ) || value.migration.metadataRelativePath.startsWith(
          "_state/migrations/",
        )
      ) ||
      !Array.isArray(value.migration.items) ||
      !value.migration.items.every((item) => {
        return isArchivedRecord(item) || isPurgedMigrationRecord(item);
      }) ||
      (value.migration.retiredMetadataRelativePath !== undefined &&
        (!isSafeLocalRelativePath(
          value.migration.retiredMetadataRelativePath,
        ) ||
          !value.migration.retiredMetadataRelativePath.startsWith(
            "archive/legacy-migration/",
          ))))
  ) {
    throw new Error("Exclusive memory ownership requires migration metadata.");
  }

  if (
    !value.quarantines.every((record) => {
      return (
        isArchivedRecord(record) &&
        typeof record.archivedAt === "string" &&
        isSafeLocalRelativePath(record.metadataRelativePath) &&
        record.metadataRelativePath.startsWith("archive/quarantine/") &&
        typeof record.quarantineId === "string"
      );
    })
  ) {
    throw new Error("Memory ownership quarantine metadata has an invalid shape.");
  }

  return value;
}

async function loadOwnershipState(paths) {
  const stored = await readJsonIfExists(
    paths.repositoryRoot,
    paths.ownershipPath,
  );
  return stored === null ? emptyOwnershipState() : validateOwnershipState(stored);
}

async function saveOwnershipState(paths, ownership) {
  await atomicWriteJson(paths.repositoryRoot, paths.ownershipPath, ownership);
}

function normalizedRelativePath(basePath, filePath) {
  return relative(basePath, filePath).replaceAll("\\", "/");
}

function localMemoryName(paths, filePath) {
  return `local/${normalizedRelativePath(paths.localRoot, filePath).replace(/\.md$/u, "")}`;
}

function isInsidePath(parentPath, filePath) {
  const relativePath = relative(parentPath, filePath);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !relativePath.startsWith("../"))
  );
}

async function listUnmanagedVisibleMemories(paths, manifest) {
  const expectedFiles = new Set([
    paths.currentTaskPath,
    paths.indexPath,
    paths.unresolvedPath,
    ...Object.values(manifest.entries).map((entry) => {
      return entryFilePath(paths, entry);
    }),
  ]);
  const visibleFiles = await listRegularFiles(
    paths.repositoryRoot,
    paths.localRoot,
    {
      excludedDirectories: [
        paths.archiveRoot,
        paths.episodesRoot,
        paths.stateRoot,
      ],
    },
  );
  const unmanaged = [];

  for (const filePath of visibleFiles) {
    if (expectedFiles.has(filePath)) {
      continue;
    }

    if (isInsidePath(paths.durableRoot, filePath)) {
      const contents = await readTextIfExists(paths.repositoryRoot, filePath);

      if ((contents ?? "").startsWith(managedFileHeader)) {
        continue;
      }
    }

    const contents = await readTextIfExists(paths.repositoryRoot, filePath);

    if (contents === null) {
      continue;
    }

    const memoryName = localMemoryName(paths, filePath);
    const policy = legacyMigrationPolicies[memoryName] ?? {
      disposition: "archive-only",
      reason: "unmanaged-local-memory",
    };

    unmanaged.push({
      contentHash: sha256(contents),
      disposition: policy.disposition,
      memoryName,
      reason: policy.reason,
      relativePath: normalizedRelativePath(paths.localRoot, filePath),
      size: contents.length,
    });
  }

  return unmanaged.sort((left, right) => {
    return left.relativePath.localeCompare(right.relativePath);
  });
}

function migrationInventory(unmanaged) {
  const inventoryHash = sha256(
    JSON.stringify(
      unmanaged.map((item) => ({
        contentHash: item.contentHash,
        disposition: item.disposition,
        memoryName: item.memoryName,
        reason: item.reason,
        relativePath: item.relativePath,
        size: item.size,
      })),
    ),
  );

  return {
    checkpointToken: sha256(`legacy-memory-migration:${inventoryHash}`),
    inventoryHash,
    migrationId: inventoryHash.slice(0, 24),
    items: unmanaged,
  };
}

async function verifyArchivedRecord(paths, record) {
  const archivePath = join(paths.localRoot, record.archiveRelativePath);
  const contents = await readTextIfExists(paths.repositoryRoot, archivePath);

  if (contents === null) {
    return `Missing archived local memory: ${record.archiveRelativePath}.`;
  }

  if (sha256(contents) !== record.contentHash) {
    return `Archived local memory hash mismatch: ${record.archiveRelativePath}.`;
  }

  return null;
}

async function validateOwnershipArchives(paths, ownership) {
  const errors = [];

  for (const record of ownership.migration?.items ?? []) {
    if (isPurgedMigrationRecord(record)) {
      continue;
    }

    const error = await verifyArchivedRecord(paths, record);

    if (error !== null) {
      errors.push(error);
    }
  }

  for (const record of ownership.quarantines) {
    const error = await verifyArchivedRecord(paths, record);

    if (error !== null) {
      errors.push(error);
    }

    const metadata = await readJsonIfExists(
      paths.repositoryRoot,
      join(paths.localRoot, record.metadataRelativePath),
    );

    if (
      metadata === null ||
      metadata.archiveRelativePath !== record.archiveRelativePath ||
      metadata.contentHash !== record.contentHash ||
      metadata.memoryName !== record.memoryName ||
      metadata.quarantineId !== record.quarantineId
    ) {
      errors.push(
        `Quarantine archive metadata is missing or stale: ${record.metadataRelativePath}.`,
      );
    }
  }

  if (ownership.migration?.metadataRelativePath !== undefined) {
    const metadata = await readJsonIfExists(
      paths.repositoryRoot,
      join(paths.localRoot, ownership.migration.metadataRelativePath),
    );

    if (
      metadata === null ||
      metadata.inventoryHash !== ownership.migration.inventoryHash ||
      metadata.migrationId !== ownership.migration.migrationId ||
      JSON.stringify(metadata.items) !==
        JSON.stringify(ownership.migration.items)
    ) {
      errors.push("Legacy migration tombstone metadata is missing or stale.");
    }
  }

  return errors;
}

function newSessionState(sessionId, now) {
  return {
    checkpointToken: randomBytes(24).toString("hex"),
    completedAt: null,
    continuationRequested: false,
    eventSequence: 0,
    events: [],
    lastCheckpointHash: null,
    lastCheckpointSequence: 0,
    lastMaterialSequence: 0,
    lastSeenAt: now.toISOString(),
    schemaVersion: memorySchemaVersion,
    sessionHash: sessionHash(sessionId),
    startedAt: now.toISOString(),
  };
}

function validateSessionState(value, expectedHash) {
  if (
    !isRecord(value) ||
    value.schemaVersion !== memorySchemaVersion ||
    value.sessionHash !== expectedHash ||
    typeof value.checkpointToken !== "string" ||
    !Array.isArray(value.events)
  ) {
    throw new Error("Managed memory session state is invalid.");
  }

  return value;
}

async function loadSession(paths, sessionId, now, options = {}) {
  const path = sessionStatePath(paths, sessionId);
  const stored = await readJsonIfExists(paths.repositoryRoot, path);
  let state =
    stored === null
      ? newSessionState(sessionId, now)
      : validateSessionState(stored, sessionHash(sessionId));

  if (options.reset) {
    state = newSessionState(sessionId, now);
  }

  state.lastSeenAt = now.toISOString();
  return { path, state };
}

async function saveSession(paths, path, state) {
  await atomicWriteJson(paths.repositoryRoot, path, state);
}

function appendSessionEvent(state, event, now) {
  state.eventSequence += 1;

  if (event.material) {
    state.lastMaterialSequence = state.eventSequence;
  }

  state.events.push({
    eventId: sha256(
      JSON.stringify({
        at: now.toISOString(),
        sequence: state.eventSequence,
        ...event,
      }),
    ),
    material: Boolean(event.material),
    paths: Array.isArray(event.paths) ? [...new Set(event.paths)].slice(0, 20) : [],
    recordedAt: now.toISOString(),
    success: event.success !== false,
    toolName: event.toolName ?? "unknown",
  });
  state.events = state.events.slice(-50);
}

function episodePath(paths, state, now) {
  const date = now.toISOString().slice(0, 10);
  return join(paths.episodesRoot, `${date}-${state.sessionHash}.jsonl`);
}

function uniqueEvidence(left, right) {
  const byKey = new Map();

  for (const item of [...left, ...right]) {
    byKey.set(`${item.type}:${item.reference}`, item);
  }

  return [...byKey.values()].sort((a, b) => {
    return `${a.type}:${a.reference}`.localeCompare(`${b.type}:${b.reference}`);
  });
}

function createEntry(candidate, episode, now) {
  const identity = candidateIdentity(candidate);

  return {
    ...candidate,
    contentHash: candidateContentHash(candidate),
    createdAt: now.toISOString(),
    expiresAt: expirationFor(candidate, now),
    id: candidateId(candidate),
    identity,
    lastConfirmedAt: now.toISOString(),
    memoryName: managedMemoryName(candidate),
    sourceEpisodes: [episode.episodeId],
  };
}

function conflictRecord(existing, incoming, episode, now, resolution, status) {
  const value = {
    existing: {
      authority: existing.authority,
      id: existing.id,
      statement: existing.statement,
    },
    identity: existing.identity,
    incoming: {
      authority: incoming.authority,
      id: candidateId(incoming),
      statement: incoming.statement,
    },
    recordedAt: now.toISOString(),
    resolution,
    sourceEpisode: episode.episodeId,
    status,
  };

  return {
    ...value,
    id: `sha256:${sha256(JSON.stringify(value))}`,
  };
}

async function appendArchiveRecord(paths, category, record, now) {
  const month = now.toISOString().slice(0, 7);
  const archivePath = join(
    paths.archiveRoot,
    category,
    month,
    "records.jsonl",
  );
  await appendJsonLine(paths.repositoryRoot, archivePath, record);
}

async function mergeCandidate(paths, manifest, candidate, episode, now) {
  const identity = candidateIdentity(candidate);
  const existing = manifest.entries[identity];

  if (existing === undefined) {
    manifest.entries[identity] = createEntry(candidate, episode, now);
    return;
  }

  if (existing.statement === candidate.statement) {
    existing.evidence = uniqueEvidence(existing.evidence, candidate.evidence);
    existing.invalidatedBy = [
      ...new Set([...existing.invalidatedBy, ...candidate.invalidatedBy]),
    ].sort();
    existing.lastConfirmedAt = now.toISOString();
    existing.sourceEpisodes = [
      ...new Set([...existing.sourceEpisodes, episode.episodeId]),
    ];
    existing.confidence = Math.max(existing.confidence, candidate.confidence);

    if (authorityRank[candidate.authority] > authorityRank[existing.authority]) {
      existing.authority = candidate.authority;
    }

    const incomingExpiration = expirationFor(candidate, now);

    if (
      existing.expiresAt !== null &&
      (incomingExpiration === null || incomingExpiration > existing.expiresAt)
    ) {
      existing.expiresAt = incomingExpiration;
    }

    existing.contentHash = candidateContentHash(existing);
    existing.id = candidateId(existing);
    return;
  }

  const incomingRank = authorityRank[candidate.authority];
  const existingRank = authorityRank[existing.authority];

  if (incomingRank > existingRank) {
    await appendArchiveRecord(
      paths,
      "superseded",
      {
        archivedAt: now.toISOString(),
        reason: "superseded-by-higher-authority",
        record: existing,
        replacementEpisode: episode.episodeId,
      },
      now,
    );
    const conflict = conflictRecord(
      existing,
      candidate,
      episode,
      now,
      "superseded-by-higher-authority",
      "resolved",
    );
    manifest.conflicts.push(conflict);
    manifest.entries[identity] = createEntry(candidate, episode, now);
    return;
  }

  const resolution =
    incomingRank === existingRank
      ? "manual-resolution-required"
      : "retained-higher-authority";
  const conflict = conflictRecord(
    existing,
    candidate,
    episode,
    now,
    resolution,
    "unresolved",
  );

  if (!manifest.conflicts.some((item) => item.id === conflict.id)) {
    manifest.conflicts.push(conflict);
  }
}

function validateEpisode(repositoryRoot, value) {
  if (
    !isRecord(value) ||
    value.type !== "checkpoint" ||
    value.schemaVersion !== memorySchemaVersion ||
    typeof value.episodeId !== "string" ||
    typeof value.recordedAt !== "string" ||
    typeof value.sessionHash !== "string"
  ) {
    throw new Error("Episode record has an invalid shape.");
  }

  return {
    ...value,
    bundle: validateCandidateBundle(repositoryRoot, value.bundle),
  };
}

async function readEpisodes(paths) {
  const files = (await listRegularFiles(
    paths.repositoryRoot,
    paths.episodesRoot,
  )).filter((filePath) => filePath.endsWith(".jsonl"));
  const episodes = [];

  for (const filePath of files) {
    const contents = await readTextIfExists(paths.repositoryRoot, filePath);

    for (const [lineIndex, line] of (contents ?? "").split(/\r?\n/).entries()) {
      if (line.trim() === "") {
        continue;
      }

      let parsed;

      try {
        parsed = JSON.parse(line);
      } catch {
        throw new Error(
          `Episode JSONL is invalid at ${relative(paths.repositoryRoot, filePath)}:${lineIndex + 1}.`,
        );
      }

      episodes.push(validateEpisode(paths.repositoryRoot, parsed));
    }
  }

  return episodes.sort((left, right) => {
    return `${left.recordedAt}:${left.episodeId}`.localeCompare(
      `${right.recordedAt}:${right.episodeId}`,
    );
  });
}

async function distillUnlocked(paths, manifest, now) {
  const episodes = await readEpisodes(paths);
  let processed = 0;

  for (const episode of episodes) {
    if (manifest.processedEpisodes[episode.episodeId] !== undefined) {
      continue;
    }

    for (const candidate of episode.bundle.candidates) {
      await mergeCandidate(paths, manifest, candidate, episode, now);
    }

    manifest.processedEpisodes[episode.episodeId] = episode.recordedAt;
    processed += 1;
  }

  return processed;
}

async function expireEntriesUnlocked(paths, manifest, now) {
  let archived = 0;

  for (const [identity, entry] of Object.entries(manifest.entries)) {
    if (entry.expiresAt === null || Date.parse(entry.expiresAt) > now.getTime()) {
      continue;
    }

    await appendArchiveRecord(
      paths,
      "expired",
      {
        archivedAt: now.toISOString(),
        reason: "ttl-expired",
        record: entry,
      },
      now,
    );
    delete manifest.entries[identity];
    archived += 1;
  }

  return archived;
}

async function archiveEpisodeFilesUnlocked(paths, manifest, now) {
  const episodeFiles = (await listRegularFiles(
    paths.repositoryRoot,
    paths.episodesRoot,
  )).filter((filePath) => filePath.endsWith(".jsonl"));
  let archived = 0;

  for (const filePath of episodeFiles) {
    const modifiedAt = await fileModifiedAt(paths.repositoryRoot, filePath);

    if (
      modifiedAt === null ||
      now.getTime() - Date.parse(modifiedAt) <
        memoryTtlDays.episode * 86_400_000
    ) {
      continue;
    }

    const contents = await readTextIfExists(paths.repositoryRoot, filePath);

    for (const line of (contents ?? "").split(/\r?\n/)) {
      if (line.trim() === "") {
        continue;
      }

      const episode = validateEpisode(
        paths.repositoryRoot,
        JSON.parse(line),
      );

      if (manifest.processedEpisodes[episode.episodeId] === undefined) {
        throw new Error(
          `Cannot archive unprocessed episode ${episode.episodeId}.`,
        );
      }

      delete manifest.processedEpisodes[episode.episodeId];
    }

    const month = modifiedAt.slice(0, 7);
    const targetPath = join(
      paths.archiveRoot,
      "episodes",
      month,
      basename(filePath),
    );
    await moveManagedFile(paths.repositoryRoot, filePath, targetPath);
    archived += 1;
  }

  return archived;
}

function entryFilePath(paths, entry) {
  return join(paths.memoryRoot, ...`${entry.memoryName}.md`.split("/"));
}

async function renderManagedUnlocked(paths, manifest, ownershipState) {
  const ownership = ownershipState ?? (await loadOwnershipState(paths));
  const entries = Object.values(manifest.entries);
  const expectedFiles = new Set();

  for (const entry of entries) {
    const filePath = entryFilePath(paths, entry);
    expectedFiles.add(filePath);
    await atomicWriteText(
      paths.repositoryRoot,
      filePath,
      renderDurableMemory(entry),
    );
  }

  const existingFiles = await listRegularFiles(
    paths.repositoryRoot,
    paths.durableRoot,
  );

  for (const filePath of existingFiles) {
    if (!expectedFiles.has(filePath)) {
      const contents = await readTextIfExists(paths.repositoryRoot, filePath);

      if (!(contents ?? "").startsWith(managedFileHeader)) {
        throw new Error(
          `Refusing to remove unmanaged file under local/durable: ${relative(paths.repositoryRoot, filePath)}`,
        );
      }

      await removeManagedFile(paths.repositoryRoot, filePath);
    }
  }

  const currentTask = await readTextIfExists(
    paths.repositoryRoot,
    paths.currentTaskPath,
  );
  await atomicWriteText(
    paths.repositoryRoot,
    paths.indexPath,
    renderIndex(entries, { includeCurrentTask: currentTask !== null }),
  );
  await atomicWriteText(
    paths.repositoryRoot,
    paths.unresolvedPath,
    renderUnresolved(manifest.conflicts, ownership.quarantines),
  );
}

async function expectedRenderedFiles(paths, manifest, ownershipState) {
  const ownership = ownershipState ?? (await loadOwnershipState(paths));
  const expected = new Map();

  for (const entry of Object.values(manifest.entries)) {
    expected.set(entryFilePath(paths, entry), renderDurableMemory(entry));
  }

  const currentTask = await readTextIfExists(
    paths.repositoryRoot,
    paths.currentTaskPath,
  );
  expected.set(
    paths.indexPath,
    renderIndex(Object.values(manifest.entries), {
      includeCurrentTask: currentTask !== null,
    }),
  );
  expected.set(
    paths.unresolvedPath,
    renderUnresolved(manifest.conflicts, ownership.quarantines),
  );
  return expected;
}

async function validateManagedUnlocked(paths, manifest, ownershipState) {
  const ownership = ownershipState ?? (await loadOwnershipState(paths));
  const errors = [];
  const expected = await expectedRenderedFiles(paths, manifest, ownership);
  const durableFiles = await listRegularFiles(
    paths.repositoryRoot,
    paths.durableRoot,
  );

  for (const filePath of durableFiles) {
    if (!expected.has(filePath)) {
      errors.push(
        `Unexpected managed durable memory: ${relative(paths.memoryRoot, filePath).replaceAll("\\", "/")}.`,
      );
    }
  }

  for (const [filePath, expectedContents] of expected) {
    const actual = await readTextIfExists(paths.repositoryRoot, filePath);

    if (actual === null) {
      errors.push(
        `Missing managed memory: ${relative(paths.memoryRoot, filePath).replaceAll("\\", "/")}.`,
      );
    } else if (actual.replaceAll("\r\n", "\n") !== expectedContents) {
      errors.push(
        `Stale managed memory: ${relative(paths.memoryRoot, filePath).replaceAll("\\", "/")}.`,
      );
    }
  }

  const knownMemoryNames = new Set([
    "local/index",
    "local/unresolved",
    ...Object.values(manifest.entries).map((entry) => entry.memoryName),
  ]);
  const currentTask = await readTextIfExists(
    paths.repositoryRoot,
    paths.currentTaskPath,
  );

  if (currentTask !== null) {
    knownMemoryNames.add("local/current-task");
  }

  for (const [filePath, contents] of expected) {
    for (const match of contents.matchAll(/mem:([a-z0-9][a-z0-9/-]*)/g)) {
      if (!knownMemoryNames.has(match[1])) {
        errors.push(
          `${relative(paths.memoryRoot, filePath).replaceAll("\\", "/")} references missing memory mem:${match[1]}.`,
        );
      }
    }
  }

  const unmanaged = await listUnmanagedVisibleMemories(paths, manifest);

  if (ownership.mode === "exclusive" && unmanaged.length > 0) {
    for (const item of unmanaged) {
      errors.push(
        `Unmanaged visible local memory in exclusive mode: ${item.memoryName}.`,
      );
    }
  }

  errors.push(...(await validateOwnershipArchives(paths, ownership)));

  return errors;
}

async function checkpointUnlocked(paths, state, taskContents, now) {
  const bundle = parseCandidateBundleFromTask(
    paths.repositoryRoot,
    taskContents,
    { expectedCheckpointToken: state.checkpointToken },
  );
  const taskHash = sha256(taskContents.replaceAll("\r\n", "\n"));
  const episodeId = `sha256:${sha256(
    JSON.stringify({
      bundle,
      sessionHash: state.sessionHash,
      taskHash,
    }),
  )}`;

  if (state.lastCheckpointHash !== episodeId) {
    await appendJsonLine(
      paths.repositoryRoot,
      episodePath(paths, state, now),
      {
        bundle,
        episodeId,
        recordedAt: now.toISOString(),
        schemaVersion: memorySchemaVersion,
        sessionHash: state.sessionHash,
        type: "checkpoint",
      },
    );
  }

  state.lastCheckpointHash = episodeId;
  state.lastCheckpointSequence = state.lastMaterialSequence;
  state.continuationRequested = false;
  return { bundle, episodeId };
}

async function archiveInventoryItem(paths, archiveRoot, item) {
  const sourcePath = join(paths.localRoot, item.relativePath);
  const archiveRelativePath = normalizedRelativePath(
    paths.localRoot,
    join(archiveRoot, item.relativePath),
  );
  const targetPath = join(paths.localRoot, archiveRelativePath);
  const sourceContents = await readTextIfExists(
    paths.repositoryRoot,
    sourcePath,
  );
  const targetContents = await readTextIfExists(
    paths.repositoryRoot,
    targetPath,
  );

  if (sourceContents !== null) {
    if (sha256(sourceContents) !== item.contentHash) {
      throw new Error(
        `Unmanaged local memory changed before archive: ${item.memoryName}.`,
      );
    }

    if (
      targetContents !== null &&
      sha256(targetContents) !== item.contentHash
    ) {
      throw new Error(
        `Archive target hash mismatch for ${item.memoryName}: ${archiveRelativePath}.`,
      );
    }

    if (targetContents === null) {
      await atomicWriteText(
        paths.repositoryRoot,
        targetPath,
        sourceContents,
      );
    }
  } else if (
    targetContents === null ||
    sha256(targetContents) !== item.contentHash
  ) {
    throw new Error(
      `Cannot recover archived local memory ${item.memoryName}; neither source nor a valid archive exists.`,
    );
  }

  return {
    ...item,
    archiveRelativePath,
  };
}

function migrationRecordRelativePath(paths, migrationId) {
  return normalizedRelativePath(
    paths.localRoot,
    join(paths.migrationRecordsRoot, `${migrationId}.json`),
  );
}

function migrationTombstone(item, purgedAt, retiredArchiveRelativePath) {
  const inventoryItem = { ...item };
  const existingPurgedAt = inventoryItem.purgedAt;
  const existingRetiredArchiveRelativePath =
    inventoryItem.retiredArchiveRelativePath;
  delete inventoryItem.archiveRelativePath;
  delete inventoryItem.purgedAt;
  delete inventoryItem.retiredArchiveRelativePath;
  const tombstone = {
    ...inventoryItem,
    purgedAt: existingPurgedAt ?? purgedAt,
  };
  const retiredPath =
    existingRetiredArchiveRelativePath ?? retiredArchiveRelativePath;

  if (retiredPath !== undefined) {
    tombstone.retiredArchiveRelativePath = retiredPath;
  }

  return tombstone;
}

function migrationRecordPayload(migration, items, appliedAt, purgedAt) {
  return {
    appliedAt,
    inventoryHash: migration.inventoryHash,
    items,
    migrationId: migration.migrationId,
    purgedAt,
    schemaVersion: migrationSchemaVersion,
  };
}

function hasSameInventory(left, right) {
  return (
    left.contentHash === right.contentHash &&
    left.disposition === right.disposition &&
    left.memoryName === right.memoryName &&
    left.reason === right.reason &&
    left.relativePath === right.relativePath &&
    left.size === right.size
  );
}

async function prepareMigrationTombstones(paths, migration, now) {
  const metadataRelativePath = migrationRecordRelativePath(
    paths,
    migration.migrationId,
  );
  const metadataPath = join(paths.localRoot, metadataRelativePath);
  const existing = await readJsonIfExists(
    paths.repositoryRoot,
    metadataPath,
  );
  let appliedAt = now.toISOString();
  let purgedAt = appliedAt;
  let tombstones;

  if (existing !== null) {
    if (
      existing.inventoryHash !== migration.inventoryHash ||
      existing.migrationId !== migration.migrationId ||
      typeof existing.appliedAt !== "string" ||
      typeof existing.purgedAt !== "string" ||
      !Array.isArray(existing.items) ||
      existing.items.length !== migration.items.length ||
      !existing.items.every((item, index) => {
        return (
          isPurgedMigrationRecord(item) &&
          hasSameInventory(item, migration.items[index])
        );
      })
    ) {
      throw new Error("Existing legacy migration tombstone metadata is stale.");
    }

    appliedAt = existing.appliedAt;
    purgedAt = existing.purgedAt;
    tombstones = existing.items;
  } else {
    tombstones = migration.items.map((item) => {
      return migrationTombstone(item, purgedAt);
    });
  }

  for (const item of migration.items) {
    const sourceContents = await readTextIfExists(
      paths.repositoryRoot,
      join(paths.localRoot, item.relativePath),
    );

    if (
      sourceContents !== null &&
      sha256(sourceContents) !== item.contentHash
    ) {
      throw new Error(
        `Unmanaged local memory changed before purge: ${item.memoryName}.`,
      );
    }

    if (sourceContents === null && existing === null) {
      throw new Error(
        `Cannot purge missing legacy memory without tombstone metadata: ${item.memoryName}.`,
      );
    }
  }

  await atomicWriteJson(
    paths.repositoryRoot,
    metadataPath,
    migrationRecordPayload(
      migration,
      tombstones,
      appliedAt,
      purgedAt,
    ),
  );
  return {
    appliedAt,
    metadataRelativePath,
    purgedAt,
    tombstones,
  };
}

async function cleanupRetiredLegacyFiles(paths, migration) {
  let removed = 0;

  for (const item of migration.items) {
    if (item.retiredArchiveRelativePath === undefined) {
      continue;
    }

    const retiredPath = join(
      paths.localRoot,
      item.retiredArchiveRelativePath,
    );
    const contents = await readTextIfExists(paths.repositoryRoot, retiredPath);

    if (contents !== null && sha256(contents) !== item.contentHash) {
      throw new Error(
        `Retired legacy archive hash mismatch: ${item.retiredArchiveRelativePath}.`,
      );
    }

    if (contents !== null) {
      await removeManagedFile(paths.repositoryRoot, retiredPath);
      removed += 1;
    }
  }

  if (migration.retiredMetadataRelativePath !== undefined) {
    const retiredMetadataPath = join(
      paths.localRoot,
      migration.retiredMetadataRelativePath,
    );
    await removeManagedFile(
      paths.repositoryRoot,
      retiredMetadataPath,
    );
    await removeEmptyManagedDirectory(
      paths.repositoryRoot,
      dirname(retiredMetadataPath),
    );
    await removeEmptyManagedDirectory(
      paths.repositoryRoot,
      paths.legacyArchiveRoot,
    );
  }

  return removed;
}

async function purgeCompletedLegacyMigrationUnlocked(paths, ownership, now) {
  if (ownership.mode !== "exclusive") {
    return 0;
  }

  if (ownership.migration.items.every(isPurgedMigrationRecord)) {
    return cleanupRetiredLegacyFiles(paths, ownership.migration);
  }

  const archivedItems = ownership.migration.items;

  for (const item of archivedItems) {
    if (!isArchivedRecord(item)) {
      throw new Error("Legacy migration ownership contains mixed invalid records.");
    }

    const error = await verifyArchivedRecord(paths, item);

    if (error !== null) {
      throw new Error(error);
    }
  }

  const purgedAt = now.toISOString();
  const tombstones = archivedItems.map((item) => {
    return migrationTombstone(item, purgedAt, item.archiveRelativePath);
  });
  const metadataRelativePath = migrationRecordRelativePath(
    paths,
    ownership.migration.migrationId,
  );
  const retiredMetadataRelativePath =
    ownership.migration.metadataRelativePath.startsWith(
      "archive/legacy-migration/",
    )
      ? ownership.migration.metadataRelativePath
      : undefined;
  const upgradedMigration = {
    ...ownership.migration,
    items: tombstones,
    metadataRelativePath,
    purgedAt,
    retiredMetadataRelativePath,
  };
  await atomicWriteJson(
    paths.repositoryRoot,
    join(paths.localRoot, metadataRelativePath),
    migrationRecordPayload(
      upgradedMigration,
      tombstones,
      ownership.migration.appliedAt,
      purgedAt,
    ),
  );
  const upgradedOwnership = {
    ...ownership,
    migration: upgradedMigration,
  };
  const errors = await validateOwnershipArchives(paths, upgradedOwnership);

  if (errors.length > 0) {
    throw new Error(
      `Legacy migration tombstone validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  await saveOwnershipState(paths, upgradedOwnership);
  ownership.migration = upgradedMigration;
  return cleanupRetiredLegacyFiles(paths, upgradedMigration);
}

async function quarantineUnmanagedUnlocked(paths, manifest, ownership, now) {
  if (ownership.mode !== "exclusive") {
    return [];
  }

  const unmanaged = await listUnmanagedVisibleMemories(paths, manifest);
  const quarantined = [];

  for (const item of unmanaged) {
    const quarantineId = sha256(
      JSON.stringify({
        contentHash: item.contentHash,
        memoryName: item.memoryName,
      }),
    ).slice(0, 24);
    const archiveRoot = join(paths.quarantineArchiveRoot, quarantineId);
    const archived = await archiveInventoryItem(paths, archiveRoot, item);
    const metadataRelativePath = normalizedRelativePath(
      paths.localRoot,
      join(archiveRoot, "quarantine.json"),
    );
    const record = {
      ...archived,
      archivedAt: now.toISOString(),
      metadataRelativePath,
      quarantineId,
      status: "unresolved",
    };

    if (
      !ownership.quarantines.some((existing) => {
        return existing.quarantineId === quarantineId;
      })
    ) {
      ownership.quarantines.push(record);
      quarantined.push(record);
    }

    await atomicWriteJson(
      paths.repositoryRoot,
      join(paths.localRoot, metadataRelativePath),
      {
        archivedAt: record.archivedAt,
        archiveRelativePath: record.archiveRelativePath,
        contentHash: record.contentHash,
        memoryName: record.memoryName,
        quarantineId,
        reason: record.reason,
        schemaVersion: ownershipSchemaVersion,
      },
    );
    await removeManagedFile(
      paths.repositoryRoot,
      join(paths.localRoot, item.relativePath),
    );
  }

  if (quarantined.length > 0) {
    await saveOwnershipState(paths, ownership);
  }

  return quarantined;
}

export async function prepareMemoryMigration(
  repositoryRoot,
  { now = new Date() } = {},
) {
  const paths = memoryPaths(repositoryRoot);
  const manifest = await loadManifest(paths, now);
  const ownership = await loadOwnershipState(paths);

  if (ownership.mode === "exclusive") {
    return {
      alreadyComplete: true,
      checkpointToken: null,
      inventoryHash: ownership.migration.inventoryHash,
      items: [],
      migrationId: ownership.migration.migrationId,
      ownershipMode: ownership.mode,
    };
  }

  const inventory = migrationInventory(
    await listUnmanagedVisibleMemories(paths, manifest),
  );

  return {
    alreadyComplete: false,
    ...inventory,
    ownershipMode: ownership.mode,
  };
}

function validateMigrationState(value) {
  if (
    !isRecord(value) ||
    value.schemaVersion !== migrationSchemaVersion ||
    !["applying", "complete"].includes(value.status) ||
    !Array.isArray(value.items) ||
    !value.items.every(isInventoryItem) ||
    typeof value.checkpointToken !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.inventoryHash) ||
    !/^[a-f0-9]{24}$/.test(value.migrationId)
  ) {
    throw new Error("Memory migration state has an invalid shape.");
  }

  return value;
}

export async function applyMemoryMigration(
  repositoryRoot,
  { now = new Date() } = {},
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const manifest = await loadManifest(paths, now);
      const ownership = await loadOwnershipState(paths);

      if (ownership.mode === "exclusive") {
        const purged = await purgeCompletedLegacyMigrationUnlocked(
          paths,
          ownership,
          now,
        );
        return {
          alreadyComplete: true,
          entries: Object.keys(manifest.entries).length,
          migrationId: ownership.migration.migrationId,
          ownershipMode: ownership.mode,
          purged,
        };
      }

      const storedMigration = await readJsonIfExists(
        paths.repositoryRoot,
        paths.migrationPath,
      );
      let migration;

      if (storedMigration !== null) {
        migration = validateMigrationState(storedMigration);

        if (migration.status === "complete") {
          throw new Error(
            "Migration state is complete but exclusive ownership is missing.",
          );
        }
      } else {
        const prepared = migrationInventory(
          await listUnmanagedVisibleMemories(paths, manifest),
        );
        const taskContents = await readTextIfExists(
          paths.repositoryRoot,
          paths.currentTaskPath,
        );

        if (taskContents === null) {
          throw new Error(
            "local/current-task is required before applying the legacy migration.",
          );
        }

        const bundle = parseCandidateBundleFromTask(
          paths.repositoryRoot,
          taskContents,
          { expectedCheckpointToken: prepared.checkpointToken },
        );

        if (
          prepared.items.some((item) => item.disposition === "distill") &&
          (bundle.disposition !== "distill" || bundle.candidates.length === 0)
        ) {
          throw new Error(
            "Legacy memories marked for distillation require at least one migration candidate.",
          );
        }

        migration = {
          checkpointToken: prepared.checkpointToken,
          episodeId: null,
          inventoryHash: prepared.inventoryHash,
          items: prepared.items,
          migrationId: prepared.migrationId,
          preparedAt: now.toISOString(),
          schemaVersion: migrationSchemaVersion,
          status: "applying",
        };
        await atomicWriteJson(
          paths.repositoryRoot,
          paths.migrationPath,
          migration,
        );
      }

      if (migration.episodeId === null) {
        const taskContents = await readTextIfExists(
          paths.repositoryRoot,
          paths.currentTaskPath,
        );

        if (taskContents === null) {
          throw new Error(
            "local/current-task disappeared during legacy migration.",
          );
        }

        const checkpoint = await checkpointUnlocked(
          paths,
          {
            checkpointToken: migration.checkpointToken,
            continuationRequested: false,
            lastCheckpointHash: null,
            lastMaterialSequence: 0,
            sessionHash: `migration-${migration.migrationId}`,
          },
          taskContents,
          now,
        );
        migration.episodeId = checkpoint.episodeId;
        await atomicWriteJson(
          paths.repositoryRoot,
          paths.migrationPath,
          migration,
        );
      }

      const processed = await distillUnlocked(paths, manifest, now);
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest, ownership);
      const prePurgeErrors = await validateManagedUnlocked(
        paths,
        manifest,
        ownership,
      );

      if (prePurgeErrors.length > 0) {
        throw new Error(
          `Managed memory validation failed before legacy purge:\n- ${prePurgeErrors.join("\n- ")}`,
        );
      }

      const {
        appliedAt,
        metadataRelativePath,
        purgedAt,
        tombstones,
      } = await prepareMigrationTombstones(
        paths,
        migration,
        now,
      );

      const exclusiveOwnership = {
        enabledAt: now.toISOString(),
        migration: {
          appliedAt,
          inventoryHash: migration.inventoryHash,
          items: tombstones,
          metadataRelativePath,
          migrationId: migration.migrationId,
          purgedAt,
        },
        mode: "exclusive",
        quarantines: ownership.quarantines,
        schemaVersion: ownershipSchemaVersion,
      };
      await renderManagedUnlocked(paths, manifest, exclusiveOwnership);
      const expectedUnmanaged = new Set(
        migration.items.map((item) => item.relativePath),
      );
      const unexpectedVisible = (
        await listUnmanagedVisibleMemories(paths, manifest)
      ).filter((item) => !expectedUnmanaged.has(item.relativePath));
      const errors = await validateManagedUnlocked(
        paths,
        manifest,
        {
          ...exclusiveOwnership,
          mode: "legacy-compatible",
        },
      );
      errors.push(
        ...unexpectedVisible.map((item) => {
          return `Unexpected unmanaged visible local memory during migration: ${item.memoryName}.`;
        }),
      );

      if (errors.length > 0) {
        throw new Error(
          `Managed memory validation failed before legacy purge:\n- ${errors.join("\n- ")}`,
        );
      }

      for (const item of migration.items) {
        await removeManagedFile(
          paths.repositoryRoot,
          join(paths.localRoot, item.relativePath),
        );
      }
      await saveOwnershipState(paths, exclusiveOwnership);
      migration.completedAt = now.toISOString();
      migration.status = "complete";
      await atomicWriteJson(
        paths.repositoryRoot,
        paths.migrationPath,
        migration,
      );

      return {
        alreadyComplete: false,
        entries: Object.keys(manifest.entries).length,
        migrationId: migration.migrationId,
        ownershipMode: exclusiveOwnership.mode,
        processed,
        purged: tombstones.length,
      };
    },
    { now },
  );
}

export async function startMemorySession(
  repositoryRoot,
  { sessionId, source = "startup", now = new Date() },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now, {
        reset: source === "clear",
      });
      state.completedAt = null;
      await saveSession(paths, path, state);
      return {
        checkpointToken: state.checkpointToken,
        sessionHash: state.sessionHash,
      };
    },
    { now },
  );
}

export async function recordMemorySessionEvent(
  repositoryRoot,
  {
    sessionId,
    event,
    now = new Date(),
  },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now);
      appendSessionEvent(state, event, now);
      await saveSession(paths, path, state);
      return {
        eventSequence: state.eventSequence,
        lastMaterialSequence: state.lastMaterialSequence,
      };
    },
    { now },
  );
}

export async function checkpointMemory(
  repositoryRoot,
  { sessionId, now = new Date() },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now);
      const taskContents = await readTextIfExists(
        paths.repositoryRoot,
        paths.currentTaskPath,
      );

      if (taskContents === null) {
        throw new Error("local/current-task does not exist.");
      }

      const result = await checkpointUnlocked(paths, state, taskContents, now);
      await saveSession(paths, path, state);
      return result;
    },
    { now },
  );
}

export async function distillMemory(repositoryRoot, { now = new Date() } = {}) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const manifest = await loadManifest(paths, now);
      const processed = await distillUnlocked(paths, manifest, now);
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest);
      const errors = await validateManagedUnlocked(paths, manifest);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return {
        conflicts: manifest.conflicts.filter(
          (conflict) => conflict.status === "unresolved",
        ).length,
        entries: Object.keys(manifest.entries).length,
        processed,
      };
    },
    { now },
  );
}

export async function activateMemory(repositoryRoot, { now = new Date() } = {}) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const manifest = await loadManifest(paths, now);
      const ownership = await loadOwnershipState(paths);
      const purgedLegacy = await purgeCompletedLegacyMigrationUnlocked(
        paths,
        ownership,
        now,
      );
      const quarantined = await quarantineUnmanagedUnlocked(
        paths,
        manifest,
        ownership,
        now,
      );
      const archivedEntries = await expireEntriesUnlocked(paths, manifest, now);
      const archivedEpisodeFiles = await archiveEpisodeFilesUnlocked(
        paths,
        manifest,
        now,
      );
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest, ownership);
      const errors = await validateManagedUnlocked(paths, manifest, ownership);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return {
        archivedEntries,
        archivedEpisodeFiles,
        entries: Object.keys(manifest.entries).length,
        ownershipMode: ownership.mode,
        purgedLegacy,
        quarantined: quarantined.length,
        unmanagedVisible: (
          await listUnmanagedVisibleMemories(paths, manifest)
        ).length,
      };
    },
    { now },
  );
}

export async function maintainMemory(repositoryRoot, { now = new Date() } = {}) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const manifest = await loadManifest(paths, now);
      const ownership = await loadOwnershipState(paths);
      const purgedLegacy = await purgeCompletedLegacyMigrationUnlocked(
        paths,
        ownership,
        now,
      );
      const quarantined = await quarantineUnmanagedUnlocked(
        paths,
        manifest,
        ownership,
        now,
      );
      const processed = await distillUnlocked(paths, manifest, now);
      const archivedEntries = await expireEntriesUnlocked(paths, manifest, now);
      const archivedEpisodeFiles = await archiveEpisodeFilesUnlocked(
        paths,
        manifest,
        now,
      );
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest, ownership);
      const errors = await validateManagedUnlocked(paths, manifest, ownership);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return {
        archivedEntries,
        archivedEpisodeFiles,
        entries: Object.keys(manifest.entries).length,
        ownershipMode: ownership.mode,
        processed,
        purgedLegacy,
        quarantined: quarantined.length,
      };
    },
    { now },
  );
}

export async function validateMemory(repositoryRoot, { now = new Date() } = {}) {
  const paths = memoryPaths(repositoryRoot);
  const manifest = await loadManifest(paths, now);
  const ownership = await loadOwnershipState(paths);
  return validateManagedUnlocked(paths, manifest, ownership);
}

export async function memoryStatus(repositoryRoot, { now = new Date() } = {}) {
  const paths = memoryPaths(repositoryRoot);
  const manifest = await loadManifest(paths, now);
  const ownership = await loadOwnershipState(paths);
  const episodeFiles = (await listRegularFiles(
    paths.repositoryRoot,
    paths.episodesRoot,
  )).filter((filePath) => filePath.endsWith(".jsonl"));
  const unmanaged = await listUnmanagedVisibleMemories(paths, manifest);
  const validationErrors = await validateManagedUnlocked(
    paths,
    manifest,
    ownership,
  );
  let retiredLegacyFiles = 0;

  for (const item of ownership.migration?.items ?? []) {
    if (
      item.retiredArchiveRelativePath !== undefined &&
      (await readTextIfExists(
        paths.repositoryRoot,
        join(paths.localRoot, item.retiredArchiveRelativePath),
      )) !== null
    ) {
      retiredLegacyFiles += 1;
    }
  }

  return {
    conflicts: manifest.conflicts.filter(
      (conflict) => conflict.status === "unresolved",
    ).length,
    entries: Object.keys(manifest.entries).length,
    episodeFiles: episodeFiles.length,
    legacyMigrationTombstones: (ownership.migration?.items ?? []).filter(
      isPurgedMigrationRecord,
    ).length,
    ownershipMode: ownership.mode,
    quarantined: ownership.quarantines.filter(
      (quarantine) => quarantine.status === "unresolved",
    ).length,
    schemaVersion: manifest.schemaVersion,
    retiredLegacyFiles,
    unmanagedVisible: unmanaged.length,
    updatedAt: manifest.updatedAt,
    validationErrors,
  };
}

export async function preCompactMemory(
  repositoryRoot,
  { sessionId, now = new Date() },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now);
      const taskContents = await readTextIfExists(
        paths.repositoryRoot,
        paths.currentTaskPath,
      );

      if (taskContents === null) {
        appendSessionEvent(
          state,
          {
            material: false,
            paths: [],
            success: false,
            toolName: "PreCompact",
          },
          now,
        );
        await saveSession(paths, path, state);
        return {
          checkpointed: false,
          warning: "No local/current-task memory exists before compaction.",
        };
      }

      try {
        const checkpoint = await checkpointUnlocked(
          paths,
          state,
          taskContents,
          now,
        );
        const manifest = await loadManifest(paths, now);
        await distillUnlocked(paths, manifest, now);
        await saveManifest(paths, manifest, now);
        await renderManagedUnlocked(paths, manifest);
        await saveSession(paths, path, state);
        return {
          checkpointed: true,
          episodeId: checkpoint.episodeId,
        };
      } catch (error) {
        appendSessionEvent(
          state,
          {
            material: false,
            paths: [],
            success: false,
            toolName: "PreCompact",
          },
          now,
        );
        await saveSession(paths, path, state);
        return {
          checkpointed: false,
          warning:
            error instanceof Error
              ? error.message
              : "Unable to checkpoint before compaction.",
        };
      }
    },
    { now },
  );
}

export async function stopMemorySession(
  repositoryRoot,
  {
    sessionId,
    stopHookActive = false,
    now = new Date(),
  },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now);
      const taskContents = await readTextIfExists(
        paths.repositoryRoot,
        paths.currentTaskPath,
      );
      let checkpointError = null;

      if (taskContents !== null) {
        try {
          const checkpoint = await checkpointUnlocked(
            paths,
            state,
            taskContents,
            now,
          );
          const manifest = await loadManifest(paths, now);
          const processed = await distillUnlocked(paths, manifest, now);
          const archivedEntries = await expireEntriesUnlocked(
            paths,
            manifest,
            now,
          );
          await saveManifest(paths, manifest, now);
          await renderManagedUnlocked(paths, manifest);
          const errors = await validateManagedUnlocked(paths, manifest);

          if (errors.length > 0) {
            throw new Error(
              `Managed memory validation failed:\n- ${errors.join("\n- ")}`,
            );
          }

          state.completedAt = now.toISOString();
          await saveSession(paths, path, state);
          return {
            action: "complete",
            archivedEntries,
            checkpoint: checkpoint.episodeId,
            processed,
          };
        } catch (error) {
          checkpointError =
            error instanceof Error ? error.message : "Unknown checkpoint failure.";
        }
      } else {
        checkpointError = "local/current-task does not exist.";
      }

      const checkpointRequired =
        state.lastMaterialSequence > state.lastCheckpointSequence ||
        taskContents?.includes("# Current task") === true;

      if (!checkpointRequired) {
        state.completedAt = now.toISOString();
        await saveSession(paths, path, state);
        return { action: "complete", processed: 0 };
      }

      if (!stopHookActive && !state.continuationRequested) {
        state.continuationRequested = true;
        await saveSession(paths, path, state);
        return {
          action: "continue",
          checkpointError,
          checkpointToken: state.checkpointToken,
        };
      }

      appendSessionEvent(
        state,
        {
          material: false,
          paths: [],
          success: false,
          toolName: "StopFailOpen",
        },
        now,
      );
      state.completedAt = now.toISOString();
      await saveSession(paths, path, state);
      return {
        action: "fail-open",
        warning: `Automatic memory checkpoint was not completed: ${checkpointError}`,
      };
    },
    { now },
  );
}
