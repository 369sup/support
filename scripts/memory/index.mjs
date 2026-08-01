import { randomBytes } from "node:crypto";
import {
  basename,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { pathToFileURL } from "node:url";

import {
  authorityRank,
  candidateContentHash,
  candidateId,
  candidateIdentity,
  expirationFor,
  managedMemoryName,
  memorySchemaVersion,
  memoryTtlDays,
  renderDurableMemory,
  renderIndex,
  renderUnresolved,
  sha256,
} from "./model.mjs";
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
  removeManagedFile,
  withMemoryLock,
} from "./storage.mjs";

const managedFileHeader =
  "<!-- Managed by scripts/memory. Do not edit this rendered view directly. -->";
const ownershipSchemaVersion = 1;

Object.freeze({
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

function isTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isManifestEntry(value, identity) {
  return (
    isRecord(value) &&
    value.identity === identity &&
    typeof value.id === "string" &&
    typeof value.contentHash === "string" &&
    typeof value.memoryName === "string" &&
    typeof value.statement === "string" &&
    typeof value.subject === "string" &&
    typeof value.kind === "string" &&
    typeof value.scope === "string" &&
    typeof value.authority === "string" &&
    typeof value.durability === "string" &&
    typeof value.status === "string" &&
    typeof value.confidence === "number" &&
    Array.isArray(value.evidence) &&
    value.evidence.every(
      (item) =>
        isRecord(item) &&
        typeof item.type === "string" &&
        typeof item.reference === "string",
    ) &&
    Array.isArray(value.invalidatedBy) &&
    value.invalidatedBy.every((item) => typeof item === "string") &&
    Array.isArray(value.sourceEpisodes) &&
    value.sourceEpisodes.every((item) => typeof item === "string") &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.lastConfirmedAt) &&
    (value.expiresAt === null || isTimestamp(value.expiresAt))
  );
}

function isManifestConflict(value) {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.identity === "string" &&
    isRecord(value.existing) &&
    isRecord(value.incoming) &&
    typeof value.existing.authority === "string" &&
    typeof value.existing.statement === "string" &&
    typeof value.incoming.authority === "string" &&
    typeof value.incoming.statement === "string" &&
    isTimestamp(value.recordedAt) &&
    typeof value.resolution === "string" &&
    typeof value.sourceEpisode === "string" &&
    ["resolved", "unresolved"].includes(value.status)
  );
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
    if (!isManifestEntry(entry, identity)) {
      throw new Error(`Memory manifest entry "${identity}" is invalid.`);
    }
  }

  if (!value.conflicts.every(isManifestConflict)) {
    throw new Error("Memory manifest conflict metadata is invalid.");
  }

  for (const [episodeId, processedAt] of Object.entries(
    value.processedEpisodes,
  )) {
    if (typeof episodeId !== "string" || !isTimestamp(processedAt)) {
      throw new Error("Memory manifest processed episode metadata is invalid.");
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
    mode: "exclusive",
    quarantines: [],
    schemaVersion: ownershipSchemaVersion,
  };
}

function validateOwnershipState(value) {
  if (
    !isRecord(value) ||
    value.schemaVersion !== ownershipSchemaVersion ||
    !Array.isArray(value.quarantines)
  ) {
    throw new Error("Memory ownership state has an invalid shape.");
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

  return {
    enabledAt:
      typeof value.enabledAt === "string" ? value.enabledAt : null,
    mode: "exclusive",
    quarantines: value.quarantines,
    schemaVersion: ownershipSchemaVersion,
  };
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
    ...Object.values(manifest.entries).map((entry) => entryFilePath(paths, entry)),
  ]);
  const visibleFiles = await listRegularFiles(
    paths.repositoryRoot,
    paths.localRoot,
    {
      excludedDirectories: [paths.archiveRoot, paths.episodesRoot, paths.stateRoot],
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

    unmanaged.push({
      contentHash: sha256(contents),
      disposition: "archive-only",
      memoryName: localMemoryName(paths, filePath),
      reason: "unmanaged-local-memory",
      relativePath: normalizedRelativePath(paths.localRoot, filePath),
      size: contents.length,
    });
  }

  return unmanaged.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );
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

  return errors;
}

function newSessionState(sessionId, now) {
  return {
    checkpointToken: randomBytes(24).toString("hex"),
    completedAt: null,
    continuationRequested: false,
    currentTaskHash: null,
    dirty: false,
    lastCheckpointHash: null,
    lastSeenAt: now.toISOString(),
    schemaVersion: memorySchemaVersion,
    sessionHash: sessionHash(sessionId),
    startedAt: now.toISOString(),
  };
}

function validateSessionState(value, expectedHash) {
  const legacyState =
    isRecord(value) &&
    value.schemaVersion === memorySchemaVersion &&
    value.sessionHash === expectedHash &&
    typeof value.checkpointToken === "string" &&
    Array.isArray(value.events);

  if (legacyState) {
    return {
      checkpointToken: value.checkpointToken,
      completedAt: value.completedAt ?? null,
      continuationRequested: value.continuationRequested === true,
      currentTaskHash: null,
      dirty:
        Number(value.lastMaterialSequence ?? 0) >
        Number(value.lastCheckpointSequence ?? 0),
      lastCheckpointHash: value.lastCheckpointHash ?? null,
      lastSeenAt: value.lastSeenAt,
      schemaVersion: memorySchemaVersion,
      sessionHash: value.sessionHash,
      startedAt: value.startedAt,
    };
  }

  if (
    !isRecord(value) ||
    value.schemaVersion !== memorySchemaVersion ||
    value.sessionHash !== expectedHash ||
    typeof value.checkpointToken !== "string" ||
    typeof value.dirty !== "boolean" ||
    !(
      value.currentTaskHash === null ||
      /^[a-f0-9]{64}$/u.test(value.currentTaskHash)
    )
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
    incomingRank === existingRank ? "unresolved" : "resolved",
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

async function finalizeUnlocked(
  paths,
  manifest,
  ownership,
  now,
  { distill = false, maintain = false } = {},
) {
  const quarantined = await quarantineUnmanagedUnlocked(
    paths,
    manifest,
    ownership,
    now,
  );
  const processed = distill
    ? await distillUnlocked(paths, manifest, now)
    : 0;
  const archivedEntries = maintain
    ? await expireEntriesUnlocked(paths, manifest, now)
    : 0;
  const archivedEpisodeFiles = maintain
    ? await archiveEpisodeFilesUnlocked(paths, manifest, now)
    : 0;

  await saveManifest(paths, manifest, now);
  await saveOwnershipState(paths, ownership);
  await renderManagedUnlocked(paths, manifest, ownership);
  const errors = await validateManagedUnlocked(paths, manifest, ownership);
  if (errors.length > 0) {
    throw new Error(
      `Managed memory validation failed:\n- ${errors.join("\n- ")}`,
    );
  }

  return {
    archivedEntries,
    archivedEpisodeFiles,
    entries: Object.keys(manifest.entries).length,
    ownershipMode: ownership.mode,
    processed,
    quarantined: quarantined.length,
  };
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
  state.currentTaskHash = taskHash;
  state.dirty = false;
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
      const taskContents = await readTextIfExists(
        paths.repositoryRoot,
        paths.currentTaskPath,
      );

      if (!state.dirty && state.currentTaskHash === null) {
        state.currentTaskHash =
          taskContents === null
            ? null
            : sha256(taskContents.replaceAll("\r\n", "\n"));
      }

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

export async function markMemoryDirty(
  repositoryRoot,
  {
    sessionId,
    material,
    now = new Date(),
  },
) {
  return withMemoryLock(
    repositoryRoot,
    async (paths) => {
      const { path, state } = await loadSession(paths, sessionId, now);

      if (material) {
        state.dirty = true;
      }

      await saveSession(paths, path, state);
      return {
        dirty: state.dirty,
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

      const checkpoint = await checkpointUnlocked(
        paths,
        state,
        taskContents,
        now,
      );
      const manifest = await loadManifest(paths, now);
      const ownership = await loadOwnershipState(paths);
      const result = await finalizeUnlocked(
        paths,
        manifest,
        ownership,
        now,
        { distill: true, maintain: true },
      );
      await saveSession(paths, path, state);
      return { ...checkpoint, ...result };
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
      const result = await finalizeUnlocked(
        paths,
        manifest,
        ownership,
        now,
        { maintain: true },
      );
      return {
        ...result,
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
      return finalizeUnlocked(paths, manifest, ownership, now, {
        distill: true,
        maintain: true,
      });
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

  return {
    conflicts: manifest.conflicts.filter(
      (conflict) => conflict.status === "unresolved",
    ).length,
    entries: Object.keys(manifest.entries).length,
    episodeFiles: episodeFiles.length,
    ownershipMode: ownership.mode,
    quarantined: ownership.quarantines.filter(
      (quarantine) => quarantine.status === "unresolved",
    ).length,
    schemaVersion: manifest.schemaVersion,
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
      const currentTaskHash =
        taskContents === null
          ? null
          : sha256(taskContents.replaceAll("\r\n", "\n"));
      const checkpointRequired =
        state.dirty || currentTaskHash !== state.currentTaskHash;

      if (!checkpointRequired) {
        await saveSession(paths, path, state);
        return { checkpointed: false };
      }

      if (taskContents === null) {
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
        const ownership = await loadOwnershipState(paths);
        await finalizeUnlocked(paths, manifest, ownership, now, {
          distill: true,
          maintain: true,
        });

        await saveSession(paths, path, state);
        return {
          checkpointed: true,
          episodeId: checkpoint.episodeId,
        };
      } catch (error) {
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
      const currentTaskHash =
        taskContents === null
          ? null
          : sha256(taskContents.replaceAll("\r\n", "\n"));
      const checkpointRequired =
        state.dirty || currentTaskHash !== state.currentTaskHash;

      if (!checkpointRequired) {
        state.completedAt = now.toISOString();
        await saveSession(paths, path, state);
        return { action: "complete", processed: 0 };
      }

      let checkpointError =
        taskContents === null ? "local/current-task does not exist." : null;

      if (taskContents !== null) {
        try {
          const checkpoint = await checkpointUnlocked(
            paths,
            state,
            taskContents,
            now,
          );
          const manifest = await loadManifest(paths, now);
          const ownership = await loadOwnershipState(paths);
          const finalized = await finalizeUnlocked(
            paths,
            manifest,
            ownership,
            now,
            { distill: true, maintain: true },
          );

          state.completedAt = now.toISOString();
          await saveSession(paths, path, state);
          return {
            action: "complete",
            archivedEntries: finalized.archivedEntries,
            checkpoint: checkpoint.episodeId,
            processed: finalized.processed,
          };
        } catch (error) {
          checkpointError =
            error instanceof Error ? error.message : "Unknown checkpoint failure.";
        }
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
  process.stdout.write(
    json ? `${JSON.stringify(value)}\n` : `${JSON.stringify(value, null, 2)}\n`,
  );
}

export async function runMemoryCommand(command, options = {}) {
  switch (command) {
    case "activate":
      return activateMemory(repositoryRoot);
    case "checkpoint":
      if (options.sessionId === undefined) {
        throw new Error("memory:checkpoint requires --session <session-id>.");
      }
      return checkpointMemory(repositoryRoot, { sessionId: options.sessionId });
    case "maintain":
      return maintainMemory(repositoryRoot);
    case "status":
      return memoryStatus(repositoryRoot);
    case "validate": {
      const errors = await validateMemory(repositoryRoot);
      if (errors.length > 0) {
        throw new Error(
          `Managed memory validation failed:\n- ${errors.join("\n- ")}`,
        );
      }
      return { valid: true };
    }
    default:
      throw new Error(
        "Usage: node scripts/memory/index.mjs <activate|checkpoint|maintain|status|validate> [--session <id>] [--json]",
      );
  }
}

async function runCli() {
  try {
    const { command, options } = parseArguments(process.argv.slice(2));
    output(await runMemoryCommand(command, options), options.json);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown memory CLI error.";
    process.stderr.write(`[serena-memory] ${message}\n`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  await runCli();
}
