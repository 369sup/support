import { strict as assert } from "node:assert";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  renderModuleMap,
  runArchitectureChecks,
} from "./architecture-checker.mjs";

function writeFixture(rootDir, relativePath, contents) {
  const filePath = join(rootDir, ...relativePath.split("/"));
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

function validCatalog() {
  return {
    version: 1,
    contexts: [
      {
        subdomain: "core-domain",
        name: "repositories",
        kind: "product",
        status: "active",
        responsibility: "Browser-safe primitives.",
        officialSources: [
          "https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories",
        ],
      },
    ],
  };
}

function createValidFixture() {
  const rootDir = mkdtempSync(join(tmpdir(), "support-architecture-"));
  const catalog = validCatalog();

  mkdirSync(join(rootDir, "src", "app"), { recursive: true });
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/README.md",
    "# Repositories\n",
  );
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/browser-ui.ts",
    '"use client";\nexport { Button } from "./adapters/inbound/react/button";\n',
  );
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/adapters/inbound/react/button.ts",
    "export function Button(): string { return \"button\"; }\n",
  );
  writeFixture(
    rootDir,
    "docs/architecture/module-map.json",
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  writeFixture(
    rootDir,
    "docs/architecture/module-map.md",
    renderModuleMap(catalog),
  );
  writeFixture(rootDir, "docs/architecture/exceptions/registry.json", "[]\n");
  writeFixture(
    rootDir,
    "packages/shadcn/components.json",
    `${JSON.stringify(
      {
        aliases: {
          components: "@support/shadcn/custom",
          utils: "@support/shadcn/lib/class-names",
          ui: "@support/shadcn/ui",
          lib: "@support/shadcn/lib",
          hooks: "@support/shadcn/hooks",
        },
      },
      null,
      2,
    )}\n`,
  );

  return rootDir;
}

function check(rootDir) {
  return runArchitectureChecks({
    applicationRoot: rootDir,
    repositoryRoot: rootDir,
    now: new Date("2026-07-21T00:00:00.000Z"),
  });
}

function includesRule(errors, ruleId) {
  return errors.some((error) => error.includes(ruleId));
}

test("accepts the canonical bounded-context fixture", () => {
  const rootDir = createValidFixture();

  try {
    assert.deepEqual(check(rootDir), []);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects a third src root", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "src/lib/utility.ts", "export const value = 1;\n");
    assert.equal(includesRule(check(rootDir), "ARCH-SRC-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects shadcn aliases that regenerate forbidden roots", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "components.json",
      `${JSON.stringify({ aliases: { ui: "@/components/ui" } }, null, 2)}\n`,
    );
    assert.equal(includesRule(check(rootDir), "ARCH-TOOL-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects circular dependencies", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/adapters/inbound/react/first.ts",
      'import { second } from "./second";\nexport const first = second;\n',
    );
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/adapters/inbound/react/second.ts",
      'import { first } from "./first";\nexport const second = first;\n',
    );
    assert.equal(includesRule(check(rootDir), "ARCH-GRAPH-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects server-only dependencies reachable from browser-ui.ts", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/browser-ui.ts",
      '"use client";\nexport { createUi } from "./composition/create-ui";\n',
    );
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/composition/create-ui.ts",
      "export function createUi(): string { return process.env.NODE_ENV ?? \"test\"; }\n",
    );
    assert.equal(includesRule(check(rootDir), "ARCH-CLIENT-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects ambiguous names and multiple runtime exports", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/adapters/inbound/react/utils.ts",
      "export const first = 1;\nexport const second = 2;\n",
    );
    const errors = check(rootDir);
    assert.equal(includesRule(errors, "ARCH-NAME-002"), true);
    assert.equal(includesRule(errors, "ARCH-FILE-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects nested barrels and misplaced role suffixes", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/adapters/index.ts",
      'export { Button } from "./inbound/react/button";\n',
    );
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/adapters/inbound/react/account.entity.ts",
      "export class Account {}\n",
    );
    const errors = check(rootDir);
    assert.equal(includesRule(errors, "ARCH-NAME-003"), true);
    assert.equal(includesRule(errors, "ARCH-NAME-004"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects files that bypass the two-level context structure", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/platform/orphan.ts",
      "export const orphan = true;\n",
    );
    assert.equal(includesRule(check(rootDir), "ARCH-STRUCT-002"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects unregistered and expired architecture exceptions", () => {
  const rootDir = createValidFixture();

  try {
    const buttonPath =
      "src/modules/core-domain/repositories/adapters/inbound/react/button.ts";
    writeFixture(
      rootDir,
      buttonPath,
      "// @architecture-exception ARCH-EX-001\nexport function Button(): string { return \"button\"; }\n",
    );
    assert.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-007"), true);

    const registry = [
      {
        id: "ARCH-EX-001",
        rule: "ARCH-DEP-006",
        scope: buttonPath,
        owner: "platform-team",
        reason: "Vendor constraint.",
        alternatives: "No compatible alternative.",
        risk: "Temporary coupling.",
        spreadPrevention: "Exact file scope.",
        reviewAfter: "2026-07-21",
        removalCondition: "Remove after vendor migration.",
      },
    ];
    writeFixture(
      rootDir,
      "docs/architecture/exceptions/registry.json",
      `${JSON.stringify(registry, null, 2)}\n`,
    );
    assert.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-006"), true);

    registry[0].reviewAfter = "2027-07-21";
    registry[0].scope = "src/modules/core-domain/repositories/browser-ui.ts";
    writeFixture(
      rootDir,
      "docs/architecture/exceptions/registry.json",
      `${JSON.stringify(registry, null, 2)}\n`,
    );
    assert.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-008"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects a stale generated module map", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "docs/architecture/module-map.md", "# stale\n");
    assert.equal(includesRule(check(rootDir), "ARCH-MAP-012"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
