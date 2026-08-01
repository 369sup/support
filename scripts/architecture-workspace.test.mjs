import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import { workspacePackagePolicy } from "@support/tooling/architecture/policy";

import { validateWorkspacePackages } from "./architecture/workspace.mjs";

function createWorkspaceFixture(applicationDependencies) {
  const repositoryRoot = mkdtempSync(
    join(tmpdir(), "support-workspace-policy-"),
  );

  for (const [name, policy] of Object.entries(workspacePackagePolicy)) {
    const packageRoot = join(repositoryRoot, ...policy.path.split("/"));
    const manifest = {
      name,
      private: true,
      ...(name === "support-workspace"
        ? { packageManager: "pnpm@11.15.1" }
        : {}),
    };

    if (name === "@support/web") {
      manifest.dependencies = applicationDependencies;
    }

    mkdirSync(packageRoot, { recursive: true });
    writeFileSync(
      join(packageRoot, "package.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
  }

  writeFileSync(join(repositoryRoot, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  writeFileSync(
    join(repositoryRoot, "pnpm-workspace.yaml"),
    "packages: []\nallowBuilds:\n  sharp: true\n",
  );
  const workflowsRoot = join(repositoryRoot, ".github", "workflows");
  mkdirSync(workflowsRoot, { recursive: true });
  writeFileSync(
    join(workflowsRoot, "ci.yml"),
    "steps:\n  - run: pnpm install --frozen-lockfile\n",
  );

  return repositoryRoot;
}

test("accepts one recognized provider for an exclusive dependency capability", () => {
  const repositoryRoot = createWorkspaceFixture({
    "react-hook-form": "1.0.0",
  });

  try {
    const errors = [];
    validateWorkspacePackages(repositoryRoot, errors);

    assert.deepEqual(errors, []);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("rejects overlapping providers for an exclusive dependency capability", () => {
  const repositoryRoot = createWorkspaceFixture({
    formik: "1.0.0",
    "react-hook-form": "1.0.0",
  });

  try {
    const errors = [];
    validateWorkspacePackages(repositoryRoot, errors);

    assert.deepEqual(errors, [
      "[ARCH-PKG-009] form capability has overlapping providers: formik (@support/web/dependencies); react-hook-form (@support/web/dependencies). Keep one provider across the workspace.",
    ]);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});

test("rejects an unpinned supply-chain baseline", () => {
  const repositoryRoot = createWorkspaceFixture({});
  const manifestPath = join(repositoryRoot, "package.json");
  const manifest = JSON.parse(
    readFileSync(manifestPath, "utf8"),
  );
  manifest.packageManager = "pnpm@latest";
  writeFileSync(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  try {
    const errors = [];
    validateWorkspacePackages(repositoryRoot, errors);

    assert.deepEqual(errors, [
      "[ARCH-PKG-010] Pin an exact pnpm packageManager version, commit pnpm-lock.yaml, declare allowBuilds, and install with --frozen-lockfile in CI.",
    ]);
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});
