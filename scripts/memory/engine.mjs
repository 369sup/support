import { randomBytes } from "node:crypto";
import { basename, join, relative } from "node:path";

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

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

async function renderManagedUnlocked(paths, manifest) {
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
    renderUnresolved(manifest.conflicts),
  );
}

async function expectedRenderedFiles(paths, manifest) {
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
  expected.set(paths.unresolvedPath, renderUnresolved(manifest.conflicts));
  return expected;
}

async function validateManagedUnlocked(paths, manifest) {
  const errors = [];
  const expected = await expectedRenderedFiles(paths, manifest);
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
      const archivedEntries = await expireEntriesUnlocked(paths, manifest, now);
      const archivedEpisodeFiles = await archiveEpisodeFilesUnlocked(
        paths,
        manifest,
        now,
      );
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest);
      const errors = await validateManagedUnlocked(paths, manifest);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return {
        archivedEntries,
        archivedEpisodeFiles,
        entries: Object.keys(manifest.entries).length,
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
      const processed = await distillUnlocked(paths, manifest, now);
      const archivedEntries = await expireEntriesUnlocked(paths, manifest, now);
      const archivedEpisodeFiles = await archiveEpisodeFilesUnlocked(
        paths,
        manifest,
        now,
      );
      await saveManifest(paths, manifest, now);
      await renderManagedUnlocked(paths, manifest);
      const errors = await validateManagedUnlocked(paths, manifest);

      if (errors.length > 0) {
        throw new Error(`Managed memory validation failed:\n- ${errors.join("\n- ")}`);
      }

      return {
        archivedEntries,
        archivedEpisodeFiles,
        entries: Object.keys(manifest.entries).length,
        processed,
      };
    },
    { now },
  );
}

export async function validateMemory(repositoryRoot, { now = new Date() } = {}) {
  const paths = memoryPaths(repositoryRoot);
  const manifest = await loadManifest(paths, now);
  return validateManagedUnlocked(paths, manifest);
}

export async function memoryStatus(repositoryRoot, { now = new Date() } = {}) {
  const paths = memoryPaths(repositoryRoot);
  const manifest = await loadManifest(paths, now);
  const episodeFiles = (await listRegularFiles(
    paths.repositoryRoot,
    paths.episodesRoot,
  )).filter((filePath) => filePath.endsWith(".jsonl"));
  const validationErrors = await validateManagedUnlocked(paths, manifest);

  return {
    conflicts: manifest.conflicts.filter(
      (conflict) => conflict.status === "unresolved",
    ).length,
    entries: Object.keys(manifest.entries).length,
    episodeFiles: episodeFiles.length,
    schemaVersion: manifest.schemaVersion,
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
