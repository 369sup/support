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
import {
  agentGuidanceSourcePaths,
  renderSerenaMemories,
  loadSerenaMemorySources,
} from "./serena-memory-generator.mjs";

function writeFixture(rootDir, relativePath, contents) {
  const filePath = join(rootDir, ...relativePath.split("/"));
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

function validCatalog() {
  return {
    version: 2,
    product: {
      name: "GitHub non-code product platform",
      goal: "Model GitHub product semantics without code capabilities.",
      sourcePolicy: {
        protocol: "https:",
        hostname: "docs.github.com",
        pathPrefix: "/en/",
      },
    },
    excludedCapabilities: [
      { name: "git-content", reason: "Outside the fixture boundary." },
    ],
    deferredCapabilities: [
      { name: "releases", requires: "A tag-reference provider." },
    ],
    contexts: [
      {
        subdomain: "core-domain",
        name: "repositories",
        kind: "domain",
        classification: "core",
        maturity: "stable",
        status: "active",
        responsibility: "Browser-safe primitives.",
        owns: ["Repository"],
        excludes: ["GitObject"],
        dependencies: [],
        officialSources: [
          {
            id: "core-domain-repositories-source-01",
            url: "https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories",
            supports: ["repository identity"],
            verifiedOn: "2026-07-20",
          },
        ],
        publishedEvents: [
          {
            name: "RepositoryCreated",
            version: 1,
            kind: "domain",
            meaning: "repository created.",
            sourceIds: ["core-domain-repositories-source-01"],
          },
        ],
      },
    ],
  };
}

function writeCatalog(rootDir, catalog) {
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
  writeCatalog(rootDir, catalog);
  writeFixture(rootDir, "package.json", `${JSON.stringify({ scripts: { architecture: "node scripts/check-architecture.mjs" } }, null, 2)}\n`);
  writeFixture(rootDir, "docs/architecture/rules.md", "# Architecture Rules\n");
  writeFixture(rootDir, ".gitignore", ".serena/memories/local/\n");
  writeFixture(
    rootDir,
    ".serena/project.yml",
    'read_only_memory_patterns:\n- "^(memory_maintenance|core|shared/.*)$"\n',
  );

  for (const path of agentGuidanceSourcePaths) {
    writeFixture(rootDir, path, `# ${path} guidance\n`);
  }

  const generatedMemories = renderSerenaMemories(loadSerenaMemorySources(rootDir));

  for (const [path, contents] of generatedMemories) {
    writeFixture(rootDir, `.serena/memories/${path}`, contents);
  }

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

test("rejects an invalid v2 catalog shape and source policy", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.version = 1;
    catalog.contexts[0].officialSources[0].url =
      "http://docs.github.com/en/repositories";
    writeCatalog(rootDir, catalog);

    const errors = check(rootDir);
    assert.equal(includesRule(errors, "ARCH-MAP-013"), true);
    assert.equal(includesRule(errors, "ARCH-MAP-014"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects invalid catalog dependencies", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].dependencies.push({
      context: "missing/context",
      contract: "MissingReference",
      mode: "synchronous",
    });
    writeCatalog(rootDir, catalog);

    assert.equal(includesRule(check(rootDir), "ARCH-MAP-015"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects missing, future, and stale source verification for active contexts", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].officialSources[0].verifiedOn = null;
    writeCatalog(rootDir, catalog);
    assert.equal(includesRule(check(rootDir), "ARCH-MAP-017"), true);

    catalog.contexts[0].officialSources[0].verifiedOn = "2027-01-01";
    writeCatalog(rootDir, catalog);
    assert.equal(includesRule(check(rootDir), "ARCH-MAP-017"), true);

    catalog.contexts[0].officialSources[0].verifiedOn = "2024-01-01";
    writeCatalog(rootDir, catalog);
    assert.equal(includesRule(check(rootDir), "ARCH-MAP-017"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects unversioned, duplicate, or untraceable published events", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].publishedEvents[0].version = 0;
    catalog.contexts[0].publishedEvents[0].sourceIds = ["missing-source"];
    catalog.contexts[0].publishedEvents.push({
      ...catalog.contexts[0].publishedEvents[0],
    });
    writeCatalog(rootDir, catalog);

    assert.equal(includesRule(check(rootDir), "ARCH-MAP-018"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects event dependencies that select undeclared event versions", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts.push({
      subdomain: "projections",
      name: "search",
      kind: "projection",
      maturity: "stable",
      status: "planned",
      responsibility: "Search projection.",
      owns: ["SearchDocument"],
      excludes: ["Repository"],
      dependencies: [
        {
          context: "core-domain/repositories",
          contract: "RepositorySearchEvents",
          mode: "event",
          events: [{ name: "RepositoryCreated", version: 2 }],
        },
      ],
      officialSources: [
        {
          id: "projections-search-source-01",
          url: "https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories",
          supports: ["repository search"],
          verifiedOn: "2026-07-20",
        },
      ],
      publishedEvents: [],
      eventRationale: "Read model only.",
    });
    writeCatalog(rootDir, catalog);

    assert.equal(includesRule(check(rootDir), "ARCH-MAP-015"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires a declared synchronous dependency for cross-context imports", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts.push({
      subdomain: "collaboration",
      name: "issues",
      kind: "domain",
      classification: "core",
      maturity: "stable",
      status: "active",
      responsibility: "Issue tracking.",
      owns: ["Issue"],
      excludes: ["Repository"],
      dependencies: [],
      officialSources: [
        {
          id: "collaboration-issues-source-01",
          url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues",
          supports: ["issues"],
          verifiedOn: "2026-07-20",
        },
      ],
      publishedEvents: [
        {
          name: "IssueCreated",
          version: 1,
          kind: "domain",
          meaning: "issue created.",
          sourceIds: ["collaboration-issues-source-01"],
        },
      ],
    });
    writeCatalog(rootDir, catalog);
    writeFixture(
      rootDir,
      "src/modules/collaboration/issues/README.md",
      "# Issues\n",
    );
    writeFixture(
      rootDir,
      "src/modules/collaboration/issues/browser-ui.ts",
      '"use client";\nexport { IssueCard } from "./adapters/inbound/react/issue-card";\n',
    );
    writeFixture(
      rootDir,
      "src/modules/collaboration/issues/adapters/inbound/react/issue-card.ts",
      'import { Button } from "@/modules/core-domain/repositories/browser-ui";\nexport const IssueCard = Button;\n',
    );

    assert.equal(includesRule(check(rootDir), "ARCH-DEP-010"), true);

    catalog.contexts[1].dependencies.push({
      context: "core-domain/repositories",
      contract: "RepositoryBrowserUi",
      mode: "synchronous",
    });
    writeCatalog(rootDir, catalog);

    assert.equal(includesRule(check(rootDir), "ARCH-DEP-010"), false);
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

test("rejects broken nested AGENTS links and permanent overrides", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "apps/web/AGENTS.md", "# Web\n\n[missing](missing.md)\n");
    writeFixture(rootDir, "apps/web/AGENTS.override.md", "# Override\n");

    assert.equal(includesRule(check(rootDir), "ARCH-GUIDE-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects stale or unexpected shared Serena memories", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, ".serena/memories/core.md", "# stale\n");
    writeFixture(rootDir, ".serena/memories/manual.md", "# manual shared memory\n");

    assert.equal(includesRule(check(rootDir), "ARCH-MEM-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("renders Serena memories deterministically without timestamps", () => {
  const rootDir = createValidFixture();

  try {
    const sources = loadSerenaMemorySources(rootDir);
    const first = [...renderSerenaMemories(sources)];
    const second = [...renderSerenaMemories(sources)];

    assert.deepEqual(first, second);
    assert.equal(first.some(([, contents]) => /generated at|generated on/i.test(contents)), false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
