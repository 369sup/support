import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  atomicWriteText,
  memoryPaths,
  withMemoryLock,
} from "./storage.mjs";

async function temporaryRepository() {
  return mkdtemp(join(tmpdir(), "support-memory-storage-"));
}

async function pathExists(path) {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

test("atomically replaces managed files without leaving artifacts", async () => {
  const repositoryRoot = await temporaryRepository();
  const paths = memoryPaths(repositoryRoot);

  try {
    await mkdir(paths.stateRoot, { recursive: true });
    await writeFile(paths.manifestPath, "old\n", "utf8");
    await atomicWriteText(repositoryRoot, paths.manifestPath, "new\n");

    assert.equal(await readFile(paths.manifestPath, "utf8"), "new\n");
    assert.deepEqual(
      (await readdir(paths.stateRoot)).filter((name) => name.includes(".memory-")),
      [],
    );
  } finally {
    await rm(repositoryRoot, { force: true, recursive: true });
  }
});

test("recovers interrupted atomic replacements before taking the lock", async () => {
  const repositoryRoot = await temporaryRepository();
  const paths = memoryPaths(repositoryRoot);
  const operationId = "00000000-0000-4000-8000-000000000001";
  const manifestBackup = join(
    paths.stateRoot,
    `.manifest.json.${operationId}.memory-bak`,
  );
  const indexBackup = join(
    paths.localRoot,
    `.index.md.${operationId}.memory-bak`,
  );
  const indexTemporary = join(
    paths.localRoot,
    `.index.md.${operationId}.memory-tmp`,
  );

  try {
    await mkdir(paths.stateRoot, { recursive: true });
    await writeFile(manifestBackup, "healthy manifest\n", "utf8");
    await writeFile(paths.indexPath, "committed index\n", "utf8");
    await writeFile(indexBackup, "old index\n", "utf8");
    await writeFile(indexTemporary, "partial index\n", "utf8");

    await withMemoryLock(repositoryRoot, async () => {
      assert.equal(
        await readFile(paths.manifestPath, "utf8"),
        "healthy manifest\n",
      );
      assert.equal(await readFile(paths.indexPath, "utf8"), "committed index\n");
      assert.equal(await pathExists(manifestBackup), false);
      assert.equal(await pathExists(indexBackup), false);
      assert.equal(await pathExists(indexTemporary), false);
    });

    assert.equal(await pathExists(paths.lockPath), false);
  } finally {
    await rm(repositoryRoot, { force: true, recursive: true });
  }
});

test("recovers a stale lock and always releases the acquired lock", async () => {
  const repositoryRoot = await temporaryRepository();
  const paths = memoryPaths(repositoryRoot);
  const staleTime = new Date(Date.now() - 60_000);

  try {
    await mkdir(paths.stateRoot, { recursive: true });
    await writeFile(paths.lockPath, '{"stale":true}\n', "utf8");
    await utimes(paths.lockPath, staleTime, staleTime);

    const result = await withMemoryLock(repositoryRoot, async () => "complete");

    assert.equal(result, "complete");
    assert.equal(await pathExists(paths.lockPath), false);
  } finally {
    await rm(repositoryRoot, { force: true, recursive: true });
  }
});

test("rejects a symlink at a managed file destination", async (context) => {
  const repositoryRoot = await temporaryRepository();
  const paths = memoryPaths(repositoryRoot);
  const targetPath = join(paths.stateRoot, "target.json");

  try {
    await mkdir(paths.stateRoot, { recursive: true });
    await writeFile(targetPath, "{}\n", "utf8");

    try {
      await symlink("target.json", paths.manifestPath, "file");
    } catch (error) {
      if (["EPERM", "EACCES"].includes(error?.code)) {
        context.skip("Creating symlinks is not permitted in this environment.");
        return;
      }

      throw error;
    }

    await assert.rejects(
      atomicWriteText(repositoryRoot, paths.manifestPath, "{}\n"),
      /must not be a symlink/,
    );
  } finally {
    await rm(repositoryRoot, { force: true, recursive: true });
  }
});
