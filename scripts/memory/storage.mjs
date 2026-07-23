import {
  appendFile,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  rmdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { randomUUID } from "node:crypto";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import { lockPolicy } from "./policy.mjs";

export function memoryPaths(repositoryRoot) {
  const root = resolve(repositoryRoot);
  const memoryRoot = join(root, ".serena", "memories");
  const localRoot = join(memoryRoot, "local");
  const stateRoot = join(localRoot, "_state");

  return {
    archiveRoot: join(localRoot, "archive"),
    currentTaskPath: join(localRoot, "current-task.md"),
    durableRoot: join(localRoot, "durable"),
    episodesRoot: join(localRoot, "episodes"),
    indexPath: join(localRoot, "index.md"),
    legacyArchiveRoot: join(localRoot, "archive", "legacy-migration"),
    localRoot,
    lockPath: join(stateRoot, "memory.lock"),
    manifestPath: join(stateRoot, "manifest.json"),
    memoryRoot,
    migrationPath: join(stateRoot, "migration.json"),
    migrationRecordsRoot: join(stateRoot, "migrations"),
    ownershipPath: join(stateRoot, "ownership.json"),
    quarantineArchiveRoot: join(localRoot, "archive", "quarantine"),
    repositoryRoot: root,
    sessionsRoot: join(stateRoot, "sessions"),
    stateRoot,
    unresolvedPath: join(localRoot, "unresolved.md"),
  };
}

export function assertPathInside(basePath, candidatePath, label = "Path") {
  const base = resolve(basePath);
  const candidate = resolve(candidatePath);
  const relativePath = relative(base, candidate);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    relativePath.startsWith("../") ||
    isAbsolute(relativePath)
  ) {
    throw new Error(`${label} escapes its managed root.`);
  }

  return candidate;
}

async function pathType(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function ensureDirectorySafe(repositoryRoot, directoryPath) {
  const root = resolve(repositoryRoot);
  const target = assertPathInside(root, directoryPath, "Directory");
  const relativePath = relative(root, target);
  let current = root;

  for (const segment of relativePath.split(sep).filter(Boolean)) {
    current = join(current, segment);
    const info = await pathType(current);

    if (info === null) {
      try {
        await mkdir(current);
      } catch (error) {
        if (error?.code !== "EEXIST") {
          throw error;
        }

        const racedInfo = await pathType(current);

        if (
          racedInfo === null ||
          racedInfo.isSymbolicLink() ||
          !racedInfo.isDirectory()
        ) {
          throw new Error(
            `Managed directory path is not a regular directory: ${current}`,
          );
        }
      }
      continue;
    }

    if (info.isSymbolicLink()) {
      throw new Error(`Managed directory must not traverse a symlink: ${current}`);
    }

    if (!info.isDirectory()) {
      throw new Error(`Managed directory path is not a directory: ${current}`);
    }
  }
}

export async function assertRegularOrMissing(repositoryRoot, filePath) {
  assertPathInside(repositoryRoot, filePath, "File");
  const info = await pathType(filePath);

  if (info === null) {
    return;
  }

  if (info.isSymbolicLink()) {
    throw new Error(`Managed file must not be a symlink: ${filePath}`);
  }

  if (!info.isFile()) {
    throw new Error(`Managed file path is not a regular file: ${filePath}`);
  }
}

export async function readTextIfExists(repositoryRoot, filePath) {
  await assertRegularOrMissing(repositoryRoot, filePath);

  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function readJsonIfExists(repositoryRoot, filePath) {
  const contents = await readTextIfExists(repositoryRoot, filePath);

  if (contents === null) {
    return null;
  }

  try {
    return JSON.parse(contents);
  } catch {
    throw new Error(`Managed JSON file is invalid: ${filePath}`);
  }
}

export async function atomicWriteText(repositoryRoot, filePath, contents) {
  assertPathInside(repositoryRoot, filePath, "File");
  await ensureDirectorySafe(repositoryRoot, dirname(filePath));
  await assertRegularOrMissing(repositoryRoot, filePath);
  const operationId = randomUUID();
  const fileName = basename(filePath);
  const temporaryPath = join(
    dirname(filePath),
    `.${fileName}.${operationId}.memory-tmp`,
  );
  const backupPath = join(
    dirname(filePath),
    `.${fileName}.${operationId}.memory-bak`,
  );
  let backupCreated = false;
  let committed = false;

  await writeFile(temporaryPath, contents, {
    encoding: "utf8",
    flag: "wx",
  });

  try {
    await rename(temporaryPath, filePath);
    committed = true;
  } catch (error) {
    if (!["EEXIST", "EPERM"].includes(error?.code)) {
      throw error;
    }

    await rename(filePath, backupPath);
    backupCreated = true;

    try {
      await rename(temporaryPath, filePath);
      committed = true;
    } catch (commitError) {
      try {
        if ((await pathType(filePath)) === null) {
          await rename(backupPath, filePath);
          backupCreated = false;
        }
      } catch (recoveryError) {
        throw new AggregateError(
          [commitError, recoveryError],
          `Atomic memory write failed and could not restore ${filePath}.`,
        );
      }

      throw commitError;
    }
  } finally {
    await rm(temporaryPath, { force: true });

    if (committed && backupCreated) {
      await rm(backupPath, { force: true });
    }
  }
}

export async function atomicWriteJson(repositoryRoot, filePath, value) {
  await atomicWriteText(
    repositoryRoot,
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

export async function appendJsonLine(repositoryRoot, filePath, value) {
  assertPathInside(repositoryRoot, filePath, "Episode");
  await ensureDirectorySafe(repositoryRoot, dirname(filePath));
  await assertRegularOrMissing(repositoryRoot, filePath);
  await appendFile(filePath, `${JSON.stringify(value)}\n`, {
    encoding: "utf8",
  });
}

export async function removeManagedFile(repositoryRoot, filePath) {
  await assertRegularOrMissing(repositoryRoot, filePath);
  await rm(filePath, { force: true });
}

export async function removeEmptyManagedDirectory(
  repositoryRoot,
  directoryPath,
) {
  assertPathInside(repositoryRoot, directoryPath, "Directory");
  const info = await pathType(directoryPath);

  if (info === null) {
    return false;
  }

  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error(
      `Managed cleanup path is not a regular directory: ${directoryPath}`,
    );
  }

  try {
    await rmdir(directoryPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOTEMPTY") {
      return false;
    }

    throw error;
  }
}

export async function moveManagedFile(repositoryRoot, sourcePath, targetPath) {
  await assertRegularOrMissing(repositoryRoot, sourcePath);
  assertPathInside(repositoryRoot, targetPath, "Archive target");
  await ensureDirectorySafe(repositoryRoot, dirname(targetPath));
  await assertRegularOrMissing(repositoryRoot, targetPath);

  try {
    await rename(sourcePath, targetPath);
  } catch (error) {
    if (!["EEXIST", "EPERM"].includes(error?.code)) {
      throw error;
    }

    throw new Error(`Archive target already exists: ${targetPath}`);
  }
}

export async function listRegularFiles(repositoryRoot, directoryPath, options = {}) {
  assertPathInside(repositoryRoot, directoryPath, "Directory");
  const info = await pathType(directoryPath);

  if (info === null) {
    return [];
  }

  if (info.isSymbolicLink() || !info.isDirectory()) {
    throw new Error(`Managed scan root is not a regular directory: ${directoryPath}`);
  }

  const results = [];
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isSymbolicLink()) {
      throw new Error(`Managed scan encountered a symlink: ${entryPath}`);
    }

    if (entry.isDirectory()) {
      if (
        (options.excludedDirectories ?? []).some((excludedDirectory) => {
          return resolve(excludedDirectory) === resolve(entryPath);
        })
      ) {
        continue;
      }

      if (options.recursive !== false) {
        results.push(
          ...(await listRegularFiles(repositoryRoot, entryPath, options)),
        );
      }
      continue;
    }

    if (entry.isFile()) {
      results.push(entryPath);
    }
  }

  return results.sort();
}

const atomicArtifactPattern =
  /^\.(?<fileName>.+)\.(?<operationId>[0-9a-f-]{36})\.memory-(?<kind>tmp|bak)$/i;

export async function recoverAtomicWrites(repositoryRoot, directoryPath) {
  const artifacts = new Map();

  for (const artifactPath of await listRegularFiles(
    repositoryRoot,
    directoryPath,
  )) {
    const match = atomicArtifactPattern.exec(basename(artifactPath));

    if (!match?.groups) {
      continue;
    }

    const targetPath = join(dirname(artifactPath), match.groups.fileName);
    const key = `${targetPath}\0${match.groups.operationId}`;
    const record = artifacts.get(key) ?? {
      backupPath: null,
      targetPath,
      temporaryPath: null,
    };

    if (match.groups.kind === "bak") {
      record.backupPath = artifactPath;
    } else {
      record.temporaryPath = artifactPath;
    }

    artifacts.set(key, record);
  }

  let recovered = 0;

  for (const artifact of artifacts.values()) {
    await assertRegularOrMissing(repositoryRoot, artifact.targetPath);

    if (artifact.backupPath !== null) {
      if ((await pathType(artifact.targetPath)) === null) {
        await rename(artifact.backupPath, artifact.targetPath);
      } else {
        await removeManagedFile(repositoryRoot, artifact.backupPath);
      }

      recovered += 1;
    }

    if (artifact.temporaryPath !== null) {
      await removeManagedFile(repositoryRoot, artifact.temporaryPath);
      recovered += 1;
    }
  }

  return recovered;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => {
    setTimeout(resolveDelay, milliseconds);
  });
}

async function removeStaleLock(repositoryRoot, lockPath, now) {
  const lockInfo = await pathType(lockPath);

  if (lockInfo === null) {
    return true;
  }

  if (lockInfo.isSymbolicLink() || !lockInfo.isFile()) {
    throw new Error("Memory lock path is not a regular file.");
  }

  if (now.getTime() - lockInfo.mtimeMs <= lockPolicy.staleMilliseconds) {
    return false;
  }

  await removeManagedFile(repositoryRoot, lockPath);
  return true;
}

export async function withMemoryLock(repositoryRoot, operation, options = {}) {
  const paths = memoryPaths(repositoryRoot);
  const now = options.now ?? new Date();
  await ensureDirectorySafe(paths.repositoryRoot, paths.stateRoot);
  let handle;

  for (let attempt = 0; attempt <= lockPolicy.retryLimit; attempt += 1) {
    try {
      handle = await open(paths.lockPath, "wx");
      await handle.writeFile(
        JSON.stringify({
          acquiredAt: now.toISOString(),
          pid: process.pid,
        }),
        "utf8",
      );
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") {
        throw error;
      }

      if (await removeStaleLock(paths.repositoryRoot, paths.lockPath, new Date())) {
        continue;
      }

      if (attempt === lockPolicy.retryLimit) {
        throw new Error("Timed out waiting for the Serena memory lock.");
      }

      await delay(lockPolicy.retryDelayMilliseconds);
    }
  }

  try {
    await recoverAtomicWrites(paths.repositoryRoot, paths.localRoot);
    return await operation(paths);
  } finally {
    await handle?.close();
    await removeManagedFile(paths.repositoryRoot, paths.lockPath);
  }
}

export async function fileModifiedAt(repositoryRoot, filePath) {
  await assertRegularOrMissing(repositoryRoot, filePath);

  try {
    return (await stat(filePath)).mtime.toISOString();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}
