import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "vitest";

import { workspacePackagePolicy } from "@support/tooling/architecture/policy";

import { validateWorkspacePackages } from "./workspace-packages.mjs";

function writeFixture(rootDir, relativePath, contents) {
  const filePath = join(rootDir, ...relativePath.split("/"));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

function readManifest(rootDir, packagePath) {
  return JSON.parse(
    readFileSync(join(rootDir, packagePath, "package.json"), "utf8"),
  );
}

function writeManifest(rootDir, packagePath, manifest) {
  writeFixture(
    rootDir,
    `${packagePath === "." ? "" : `${packagePath}/`}package.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function createWorkspaceFixture() {
  const rootDir = mkdtempSync(join(tmpdir(), "support-workspace-policy-"));

  for (const [name, policy] of Object.entries(workspacePackagePolicy)) {
    const manifest = {
      name,
      private: true,
      type: "module",
    };

    if (policy.kind !== "root" && policy.kind !== "app") {
      manifest.exports = {
        "./public": "./src/public.ts",
      };
      writeFixture(rootDir, `${policy.path}/src/public.ts`, "export {};\n");
    }

    writeManifest(rootDir, policy.path, manifest);
  }

  return rootDir;
}

function validate(rootDir) {
  const errors = [];
  validateWorkspacePackages(rootDir, errors);
  return errors;
}

function includesRule(errors, ruleId) {
  return errors.some((error) => error.includes(`[${ruleId}]`));
}

test("accepts the canonical workspace package graph", () => {
  const rootDir = createWorkspaceFixture();

  try {
    const web = readManifest(rootDir, "apps/web");
    web.dependencies = {
      "@support/observability": "workspace:*",
    };
    writeManifest(rootDir, "apps/web", web);
    writeFixture(
      rootDir,
      "apps/web/src/telemetry.ts",
      'import "@support/observability/public";\n',
    );

    assert.deepEqual(validate(rootDir), []);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects package-to-app dependencies and invalid dependency sections", () => {
  const rootDir = createWorkspaceFixture();

  try {
    const contracts = readManifest(rootDir, "packages/contracts");
    contracts.dependencies = {
      "@support/web": "workspace:*",
    };
    writeManifest(rootDir, "packages/contracts", contracts);

    const web = readManifest(rootDir, "apps/web");
    web.dependencies = {
      "@support/tooling": "workspace:*",
    };
    writeManifest(rootDir, "apps/web", web);

    const errors = validate(rootDir);
    assert.equal(includesRule(errors, "ARCH-PKG-003"), true);
    assert.equal(includesRule(errors, "ARCH-PKG-004"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects duplicate internal dependencies and missing export targets", () => {
  const rootDir = createWorkspaceFixture();

  try {
    const web = readManifest(rootDir, "apps/web");
    web.dependencies = {
      "@support/observability": "workspace:*",
    };
    web.devDependencies = {
      "@support/observability": "workspace:*",
    };
    writeManifest(rootDir, "apps/web", web);

    const observability = readManifest(rootDir, "packages/observability");
    observability.exports["./missing"] = "./src/missing.ts";
    writeManifest(rootDir, "packages/observability", observability);

    const errors = validate(rootDir);
    assert.equal(includesRule(errors, "ARCH-PKG-002"), true);
    assert.equal(includesRule(errors, "ARCH-PKG-008"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects undeclared and unexported internal imports", () => {
  const rootDir = createWorkspaceFixture();

  try {
    writeFixture(
      rootDir,
      "apps/web/src/telemetry.ts",
      'import "@support/observability/public";\n',
    );

    const web = readManifest(rootDir, "apps/web");
    web.devDependencies = {
      "@support/tooling": "workspace:*",
    };
    writeManifest(rootDir, "apps/web", web);
    writeFixture(
      rootDir,
      "apps/web/src/private-tooling.ts",
      'import "@support/tooling/private";\n',
    );

    const errors = validate(rootDir);
    assert.equal(includesRule(errors, "ARCH-PKG-005"), true);
    assert.equal(includesRule(errors, "ARCH-PKG-006"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects cross-package relative imports", () => {
  const rootDir = createWorkspaceFixture();

  try {
    writeFixture(
      rootDir,
      "packages/contracts/src/cross-boundary.ts",
      'import "../../observability/src/public";\n',
    );

    assert.equal(includesRule(validate(rootDir), "ARCH-PKG-007"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects workspace package cycles", () => {
  const rootDir = createWorkspaceFixture();

  try {
    const eslintConfig = readManifest(rootDir, "packages/eslint-config");
    eslintConfig.dependencies = {
      "@support/tooling": "workspace:*",
    };
    writeManifest(rootDir, "packages/eslint-config", eslintConfig);

    const tooling = readManifest(rootDir, "packages/tooling");
    tooling.devDependencies = {
      "@support/eslint-config": "workspace:*",
    };
    writeManifest(rootDir, "packages/tooling", tooling);

    assert.equal(includesRule(validate(rootDir), "ARCH-PKG-008"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
