import { strict } from "node:assert";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "vitest";

import {
  renderContextReadme,
  renderModuleMap,
  runArchitectureChecks,
} from "./architecture.mjs";

function writeFixture(rootDir, relativePath, contents) {
  const filePath = join(rootDir, ...relativePath.split("/"));
  mkdirSync(join(filePath, ".."), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

function validCatalog() {
  return {
    version: 6,
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
        implementationStatus: "active",
        semanticStatus: "validated",
        responsibility: "Browser-safe primitives.",
        owns: ["Repository"],
        excludes: ["GitObject"],
        activationScope: ["create-repository"],
        dependencies: [],
        plannedRelationships: [],
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
            implementationStatus: "active",
            meaning: "repository created.",
            sourceIds: ["core-domain-repositories-source-01"],
            schema: "integration-contracts.ts#RepositoryCreatedV1",
            orderingKey: "repositoryId",
          },
        ],
        semanticClaims: [
          {
            id: "repository-identity",
            statement: "Repositories have an identity and creation lifecycle.",
            ownership: ["Repository"],
            events: ["RepositoryCreated@1"],
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
  for (const context of catalog.contexts) {
    const readmePath =
      `src/modules/${context.subdomain}/${context.name}/README.md`;
    if (!existsSync(join(rootDir, ...readmePath.split("/")))) {
      writeFixture(rootDir, readmePath, renderContextReadme(context));
    }
  }
}

function createValidFixture() {
  const rootDir = mkdtempSync(join(tmpdir(), "support-architecture-"));
  const catalog = validCatalog();

  mkdirSync(join(rootDir, "src", "app"), { recursive: true });
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/README.md",
    `# Repositories

## Purpose
## Context content tree

- Repository management
  - Repository creation [active]
    - Use case: \`create-repository\`
    - Owned concepts: \`Repository\`
    - Published events: \`RepositoryCreated@1\`

## Designed use cases

### \`create-repository\` [active]

- **Type:** \`command\`
- **Application boundary:** \`CreateRepositoryUseCase.createRepository()\`
- **Public entrypoint:** \`server-api.ts#createRepository\`
- **Input:** Repository creation request.
- **Success result:** Created repository identity.
- **Expected rejections:** \`none\`
- **Authorization:** Repository creation policy.
- **Transaction:** One context-local transaction.
- **Idempotency:** Request-scoped idempotency key.
- **Dependencies:** \`none\`
- **Published events:** \`RepositoryCreated@1\`
- **Official evidence:** \`core-domain-repositories-source-01\`
- **Local policy:** \`none\`

## Ubiquitous language
## Ownership and invariants
## Public capabilities
## Dependencies and consistency
## Authorization
## Persistence and transactions
## Data classification
## Retention and erasure
## Events and failure behavior
## Official sources
## Exceptions
`,
  );
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/server-api.ts",
    "export async function createRepository(): Promise<void> {}\n",
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
    "src/modules/core-domain/repositories/integration-contracts.ts",
    "export type RepositoryCreatedV1 = { repositoryId: string };\n",
  );
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/application/ports/inbound/create-repository.use-case.ts",
    "export interface CreateRepositoryUseCase { createRepository(): Promise<void>; }\n",
  );
  writeFixture(
    rootDir,
    "src/modules/core-domain/repositories/application/commands/create-repository.handler.ts",
    'import type { CreateRepositoryUseCase } from "../ports/inbound/create-repository.use-case";\nexport class CreateRepositoryHandler implements CreateRepositoryUseCase { async createRepository(): Promise<void> {} }\n',
  );
  writeCatalog(rootDir, catalog);
  writeFixture(
    rootDir,
    "package.json",
    `${JSON.stringify(
      {
        scripts: {
          architecture: "node scripts/architecture.mjs check --profile=required",
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFixture(
    rootDir,
    "docs/architecture/architecture.md",
    "# Architecture Contract\n",
  );
  writeFixture(rootDir, "AGENTS.md", "# Repository guidance\n");

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

function check(rootDir, profile = "required") {
  return runArchitectureChecks({
    applicationRoot: rootDir,
    repositoryRoot: rootDir,
    now: new Date("2026-07-21T00:00:00.000Z"),
    profile,
    validateWorkspace: false,
  });
}

function includesRule(errors, ruleId) {
  return errors.some((error) => error.ruleId === ruleId);
}

test("accepts the canonical bounded-context fixture", () => {
  const rootDir = createValidFixture();

  try {
    strict.deepEqual(check(rootDir), []);
    strict.deepEqual(check(rootDir, "knowledge"), []);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("returns structured violations and rejects invalid profiles", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "src/lib/forbidden.ts", "export {};\n");
    const [violation] = check(rootDir);

    strict.deepEqual(
      Object.keys(violation).sort(),
      ["category", "gate", "message", "ruleId"],
    );
    strict.equal(violation.ruleId, "ARCH-SRC-001");
    strict.equal(violation.gate, "required");
    strict.throws(
      () => check(rootDir, "unsupported"),
      /Invalid architecture profile unsupported/,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects an invalid v6 catalog shape and source policy", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.version = 1;
    catalog.contexts[0].officialSources[0].url =
      "http://docs.github.com/en/repositories";
    writeCatalog(rootDir, catalog);

    const errors = check(rootDir);
    strict.equal(includesRule(errors, "ARCH-MAP-013"), true);
    strict.equal(includesRule(errors, "ARCH-MAP-014"), true);
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

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-015"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("separates required source validity from knowledge freshness", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].officialSources[0].verifiedOn = null;
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-017"), true);

    catalog.contexts[0].officialSources[0].verifiedOn = "2027-01-01";
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-017"), true);

    catalog.contexts[0].officialSources[0].verifiedOn = "2024-01-01";
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-017"), false);
    strict.equal(
      includesRule(check(rootDir, "knowledge"), "ARCH-KNOWLEDGE-001"),
      true,
    );
    strict.equal(
      includesRule(check(rootDir, "all"), "ARCH-KNOWLEDGE-001"),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("renders independent source freshness and semantic status", () => {
  const catalog = validCatalog();
  let markdown = renderModuleMap(catalog);

  strict.match(markdown, /\| active \| fresh \| validated \|/);
  strict.doesNotMatch(markdown, /verified 2026/);
  strict.match(markdown, /checked 2026-07-20/);

  catalog.contexts[0].officialSources[0].verifiedOn = null;
  markdown = renderModuleMap(catalog);
  strict.match(markdown, /\| active \| unverified \| validated \|/);
  strict.match(markdown, /, unverified\)/);

  catalog.contexts[0].officialSources[0].verifiedOn = "2024-01-01";
  markdown = renderModuleMap(catalog);
  strict.match(markdown, /\| active \| stale \| validated \|/);

  catalog.contexts.push({
    subdomain: "platform",
    name: "event-publication",
    kind: "technical",
    classification: "generic",
    maturity: "stable",
    implementationStatus: "planned",
    semanticStatus: "not-applicable",
    responsibility: "Publish integration events.",
    owns: ["EventPublication"],
    excludes: ["ProductPolicy"],
    activationScope: [],
    dependencies: [],
    plannedRelationships: [],
    semanticClaims: [],
    officialSources: [],
    publishedEvents: [],
    eventRationale: "Technical infrastructure does not publish product events.",
  });
  markdown = renderModuleMap(catalog);
  strict.match(markdown, /\| planned \| not-applicable \| not-applicable \|/);
});

test("requires validated semantics before activating a product context", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].semanticStatus = "candidate";
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-021"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires activation scope only for active contexts", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].activationScope = [];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-023"), true);

    catalog.contexts[0].implementationStatus = "planned";
    catalog.contexts[0].activationScope = ["create-repository"];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-023"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires runtime dependency targets to be active", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts.push({
      subdomain: "platform",
      name: "event-publication",
      kind: "technical",
      classification: "generic",
      maturity: "stable",
      implementationStatus: "planned",
      semanticStatus: "not-applicable",
      responsibility: "Publish integration events.",
      owns: ["EventPublication"],
      excludes: ["ProductPolicy"],
      activationScope: [],
      dependencies: [],
      plannedRelationships: [],
      semanticClaims: [],
      officialSources: [],
      publishedEvents: [],
      eventRationale: "Technical infrastructure does not publish product events.",
    });
    catalog.contexts[0].dependencies.push({
      context: "platform/event-publication",
      contract: "EventPublisher",
      mode: "synchronous",
    });
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-022"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires validated ownership and events to have semantic claims", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].semanticClaims[0].ownership = [];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-024"), true);

    catalog.contexts[0].semanticClaims[0].ownership = ["Repository"];
    catalog.contexts[0].semanticClaims[0].events = [];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-025"), true);

    catalog.contexts[0].semanticClaims[0].events = ["RepositoryCreated@1"];
    catalog.contexts[0].semanticClaims[0].sourceIds = ["missing-source"];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-024"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires canonical decision headings in context READMEs", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "src/modules/core-domain/repositories/README.md", "# Repositories\n");
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires catalog references in active context content trees", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace("    - Use case: `create-repository`\n", ""),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace("    - Owned concepts: `Repository`\n", ""),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace("    - Published events: `RepositoryCreated@1`\n", ""),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires active published events to expose schemas and ordering keys", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    delete catalog.contexts[0].publishedEvents[0].schema;
    delete catalog.contexts[0].publishedEvents[0].orderingKey;
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-020"), true);

    catalog.contexts[0].publishedEvents[0].schema = "integration-contracts.ts#MissingEventV1";
    catalog.contexts[0].publishedEvents[0].orderingKey = "repositoryId";
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-020"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("supports incremental planned and active event delivery", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].publishedEvents.push({
      name: "RepositoryRenamed",
      version: 1,
      kind: "domain",
      implementationStatus: "planned",
      meaning: "repository renamed.",
      sourceIds: ["core-domain-repositories-source-01"],
    });
    catalog.contexts[0].semanticClaims[0].events.push("RepositoryRenamed@1");
    writeCatalog(rootDir, catalog);

    let errors = check(rootDir);
    strict.equal(includesRule(errors, "ARCH-MAP-020"), false);
    strict.equal(includesRule(errors, "ARCH-MAP-026"), false);

    catalog.contexts[0].publishedEvents[1].schema =
      "integration-contracts.ts#RepositoryRenamedV1";
    catalog.contexts[0].publishedEvents[1].orderingKey = "repositoryId";
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-026"), true);

    delete catalog.contexts[0].publishedEvents[1].schema;
    delete catalog.contexts[0].publishedEvents[1].orderingKey;
    catalog.contexts[0].implementationStatus = "planned";
    catalog.contexts[0].activationScope = [];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-026"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("runtime event dependencies consume only active events", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].publishedEvents[0].implementationStatus = "planned";
    delete catalog.contexts[0].publishedEvents[0].schema;
    delete catalog.contexts[0].publishedEvents[0].orderingKey;
    catalog.contexts.push({
      subdomain: "platform",
      name: "event-consumer",
      kind: "technical",
      classification: "generic",
      maturity: "stable",
      implementationStatus: "planned",
      semanticStatus: "not-applicable",
      responsibility: "Consume repository events.",
      owns: ["EventCheckpoint"],
      excludes: ["Repository"],
      activationScope: [],
      dependencies: [
        {
          context: "core-domain/repositories",
          contract: "RepositoryEvents",
          mode: "event",
          events: [{ name: "RepositoryCreated", version: 1 }],
        },
      ],
      plannedRelationships: [],
      officialSources: [],
      publishedEvents: [],
      eventRationale: "The consumer does not publish events.",
      semanticClaims: [],
    });
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-DEP-014"), true);

    const consumer = catalog.contexts[1];
    consumer.plannedRelationships = consumer.dependencies;
    consumer.dependencies = [];
    writeCatalog(rootDir, catalog);
    strict.equal(includesRule(check(rootDir), "ARCH-DEP-014"), false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("keeps the repository semantic catalog boundaries regression-safe", () => {
  const catalog = JSON.parse(
    readFileSync(join(import.meta.dirname, "..", "docs", "architecture", "module-map.json"), "utf8"),
  );
  const byPath = new Map(
    catalog.contexts.map((item) => [`${item.subdomain}/${item.name}`, item]),
  );
  const hasEventRelationship = (owner, target, event) => [
    ...byPath.get(owner).dependencies,
    ...byPath.get(owner).plannedRelationships,
  ]
    .some((dependency) => dependency.context === target &&
      dependency.mode === "event" &&
      dependency.events.some((selected) => selected.name === event && selected.version === 1));

  strict.equal(catalog.version, 6);
  strict.equal(catalog.contexts.length, 67);
  strict.equal(catalog.contexts.every((item) => item.status === undefined), true);
  strict.deepEqual(
    catalog.contexts
      .filter((item) => item.implementationStatus === "active")
      .map((item) => `${item.subdomain}/${item.name}`),
    [
      "identity/accounts",
      "identity/authentication",
      "identity/account-emails",
      "identity/account-registration",
      "identity/profiles",
      "identity/social-graph",
      "enterprises/enterprises",
      "enterprises/enterprise-memberships",
      "enterprises/enterprise-teams",
      "enterprises/enterprise-roles",
      "organizations/organizations",
      "organizations/organization-memberships",
      "organizations/organization-teams",
      "organizations/organization-roles",
      "organizations/organization-policies",
      "organizations/custom-properties",
      "repositories/repositories",
      "repositories/repository-access",
      "collaboration/issues",
      "collaboration/conversations",
      "collaboration/discussions",
      "collaboration/moderation",
      "collaboration/projects",
      "engagement/stars",
      "engagement/subscriptions",
      "engagement/notifications",
      "projections/search",
      "projections/dashboard",
      "projections/activity-feed",
      "platform/event-publication",
      "platform/search-index",
      "platform/scheduled-commands",
      "platform/media-storage",
      "platform/notification-channels",
      "platform/audit-storage",
      "projections/discovery",
    ],
  );
  strict.equal(
    catalog.contexts.filter((item) => item.implementationStatus === "planned").length,
    31,
  );
  strict.equal(
    byPath.get("organizations/organization-memberships").activationScope.includes(
      "list-active-organization-memberships-for-organization",
    ),
    true,
  );
  strict.deepEqual(
    byPath.get("identity/accounts").activationScope,
    [
      "apply-account-identity-transaction",
      "delete-personal-account",
      "get-account-candidate-by-username",
      "get-account-reference-by-id",
      "get-personal-account-by-username",
    ],
  );
  strict.deepEqual(
    byPath.get("identity/account-emails").activationScope,
    [
      "add-account-email",
      "get-verified-account-id-by-email",
      "list-account-emails",
      "update-account-email-settings",
      "verify-account-email",
    ],
  );
  strict.deepEqual(
    byPath.get("platform/scheduled-commands").activationScope,
    [
      "claim-due-scheduled-commands",
      "complete-scheduled-command",
      "fail-scheduled-command",
      "reconcile-expired-command-leases",
      "schedule-command",
    ],
  );
  strict.deepEqual(
    byPath.get("platform/notification-channels").activationScope,
    ["deliver-email", "get-channel-delivery"],
  );
  strict.equal(
    byPath.get("identity/authentication").activationScope.includes(
      "manage-passkey",
    ),
    false,
  );
  strict.deepEqual(
    byPath.get("enterprises/enterprise-teams").activationScope,
    [
      "add-enterprise-team-member",
      "assign-enterprise-team-to-organization",
      "create-enterprise-team",
      "delete-enterprise-team",
      "list-enterprise-team-members",
      "list-enterprise-team-organization-assignments",
      "list-enterprise-teams",
      "remove-enterprise-team-member",
      "unassign-enterprise-team-from-organization",
      "update-enterprise-team",
    ],
  );
  strict.deepEqual(
    byPath.get("organizations/organization-teams").activationScope,
    [
      "add-team-member",
      "assign-team-maintainer",
      "create-organization-team",
      "delete-organization-team",
      "get-organization-team",
      "list-organization-teams",
      "list-team-members",
      "remove-team-member",
      "resolve-account-team-memberships",
      "revoke-team-maintainer",
      "update-organization-team",
    ],
  );
  strict.deepEqual(
    byPath.get("organizations/organization-roles").activationScope,
    [
      "assign-organization-role",
      "list-organization-role-assignments",
      "list-predefined-organization-roles",
      "resolve-organization-repository-role-contributions",
      "revoke-organization-role",
    ],
  );
  strict.deepEqual(
    byPath.get("repositories/repository-access").activationScope,
    [
      "change-team-repository-access",
      "grant-team-repository-access",
      "revoke-team-repository-access",
      "resolve-effective-repository-permission",
    ],
  );
  strict.deepEqual(
    byPath.get("repositories/repositories").activationScope,
    [
      "archive-repository",
      "change-repository-visibility",
      "create-empty-repository",
      "delete-repository",
      "get-repository-for-administration",
      "get-repository-for-viewing",
      "get-repository-by-owner-and-name",
      "list-deleted-repositories-for-restoration",
      "list-active-public-repositories-for-organization-owner",
      "list-active-public-repositories-for-personal-owner",
      "list-active-repositories-for-owner",
      "list-visible-repositories-for-owner",
      "rename-repository",
      "restore-deleted-repository",
      "unarchive-repository",
      "update-repository-profile",
    ],
  );
  strict.deepEqual(
    byPath.get("repositories/repositories").dependencies,
    [
      {
        context: "identity/accounts",
        contract: "AccountReference",
        mode: "synchronous",
      },
      {
        context: "organizations/organizations",
        contract: "OrganizationOwnerReference",
        mode: "synchronous",
      },
      {
        context: "organizations/organization-memberships",
        contract: "OrganizationMembershipReference",
        mode: "synchronous",
      },
      {
        context: "repositories/repository-access",
        contract: "EffectiveRepositoryPermissionDecision",
        mode: "synchronous",
      },
      {
        context: "platform/event-publication",
        contract: "EventRecorderPort",
        mode: "synchronous",
      },
    ],
  );
  strict.deepEqual(
    byPath
      .get("repositories/repositories")
      .publishedEvents.find(
        (event) => event.name === "RepositoryProfileUpdated",
      ),
    {
      name: "RepositoryProfileUpdated",
      version: 1,
      kind: "domain",
      implementationStatus: "active",
      meaning: "repository profile updated.",
      sourceIds: ["repositories-repositories-source-09"],
      schema: "integration-contracts.ts#RepositoryProfileUpdatedV1",
      orderingKey: "repositoryId",
    },
  );
  strict.equal(
    catalog.contexts
      .filter((item) => item.implementationStatus === "planned")
      .every((item) => item.activationScope.length === 0),
    true,
  );
  strict.deepEqual(
    byPath.get("projections/dashboard").activationScope,
    [
      "get-dashboard-repository-view",
      "get-selected-dashboard-context",
      "list-available-dashboard-contexts",
      "restore-last-valid-dashboard-context",
      "select-dashboard-context",
    ],
  );
  strict.deepEqual(
    catalog.contexts
      .filter((item) => item.publishedEvents.some(
        (event) => event.implementationStatus === "active",
      ))
      .map((item) => `${item.subdomain}/${item.name}`),
    [
      "organizations/organization-teams",
      "organizations/organization-roles",
      "repositories/repositories",
      "repositories/repository-access",
    ],
  );
  strict.equal(catalog.contexts.every((item) => item.semanticStatus !== undefined), true);
  strict.equal(
    catalog.contexts
      .filter((item) => item.semanticStatus === "validated")
      .every((item) => item.semanticClaims.length > 0),
    true,
  );
  strict.equal(byPath.get("collaboration/issue-schema").owns.includes("IssueFieldValue"), false);
  strict.equal(byPath.get("collaboration/issues").owns.includes("IssueFieldValueSet"), true);
  strict.equal(byPath.has("integrations/github-app-registrations"), true);
  strict.equal(byPath.has("integrations/oauth-app-registrations"), true);
  strict.equal(byPath.has("integrations/repository-autolinks"), true);
  strict.equal(byPath.get("projections/repository-insights").owns.includes("TrafficMetric"), false);
  for (const contextPath of [
    "platform/site-content",
    "integrations/marketplace-catalog",
    "platform/actions-route-compatibility",
    "platform/repository-content-route-compatibility",
    "platform/repository-history-route-compatibility",
    "platform/repository-reference-route-compatibility",
    "platform/pull-request-route-compatibility",
    "commerce/package-registry",
    "platform/site-publishing",
    "repositories/repository-releases",
    "repositories/repository-forks",
    "collaboration/community-profiles",
    "collaboration/wikis",
    "projections/repository-traffic",
  ]) {
    strict.equal(byPath.get(contextPath).implementationStatus, "planned");
  }
  strict.deepEqual(
    byPath.get("platform/pull-request-route-compatibility").excludes,
    ["PullRequest", "Diff", "CommitLinkage", "CodeReview"],
  );
  strict.equal(
    byPath.get("repositories/repository-releases").excludes.includes("GitTag"),
    true,
  );
  strict.equal(
    byPath.get("collaboration/wikis").excludes.includes("GitBackedWikiStorage"),
    true,
  );
  strict.equal(hasEventRelationship("engagement/stars", "repositories/repositories", "RepositoryVisibilityChanged"), true);
  strict.equal(hasEventRelationship("engagement/subscriptions", "repositories/repositories", "RepositoryVisibilityChanged"), true);
  strict.equal(hasEventRelationship("platform/notification-channels", "engagement/notifications", "NotificationDeliveryRequested"), true);
  strict.equal(byPath.has("enterprises/custom-properties"), true);
  strict.equal(
    byPath.get("enterprises/custom-properties").owns.includes("EnterpriseOrganizationPropertyDefinition"),
    true,
  );
  strict.equal(
    byPath.get("organizations/custom-properties").owns.includes("OrganizationPropertyValue"),
    false,
  );
  strict.equal(
    byPath.get("repositories/repository-metadata").plannedRelationships.some(
      (dependency) => dependency.context === "organizations/custom-properties",
    ),
    false,
  );
  strict.equal(
    byPath.get("repositories/repositories").owns.includes("RepositoryLifecycleState"),
    true,
  );
  strict.equal(
    byPath.get("collaboration/conversations").plannedRelationships.some(
      (dependency) => dependency.contract === "RepositoryLifecycleState",
    ),
    true,
  );
  strict.equal(
    byPath.get("enterprises/enterprises").plannedRelationships.some(
      (dependency) => dependency.context === "repositories/repositories",
    ),
    false,
  );
  strict.equal(
    hasEventRelationship("repositories/repository-access", "repositories/repositories", "RepositoryDeleted"),
    true,
  );
  strict.equal(
    byPath.get("repositories/repository-features").owns.includes("RepositoryDiscussionsFeatureState"),
    true,
  );
  strict.equal(
    byPath.get("collaboration/discussions").publishedEvents.some(
      (event) => event.name === "RepositoryDiscussionSpaceEnabled",
    ),
    false,
  );
  strict.equal(
    hasEventRelationship(
      "collaboration/discussions",
      "repositories/repository-features",
      "RepositoryDiscussionsEnabled",
    ),
    true,
  );
  strict.equal(
    byPath.get("integrations/github-app-registrations").publishedEvents.some(
      (event) => event.name === "AppSuspended",
    ),
    false,
  );
  strict.equal(
    byPath.get("integrations/github-app-registrations").publishedEvents.some(
      (event) => event.name === "GitHubAppOwnershipTransferred",
    ),
    true,
  );
  strict.equal(
    byPath.get("integrations/github-app-installations").publishedEvents.some(
      (event) => event.name === "GitHubAppInstallationSuspended",
    ),
    true,
  );
  strict.equal(byPath.get("platform/event-publication").owns.includes("OutboxRecord"), false);
  strict.equal(
    catalog.contexts.some((context) => context.plannedRelationships.some(
      (dependency) => dependency.context === "platform/event-publication",
    )),
    false,
  );
  strict.equal(
    byPath.get("repositories/repository-features").owns.includes("RepositoryWikiFeatureState"),
    true,
  );
  strict.equal(
    byPath.get("repositories/repository-access").publishedEvents.some(
      (event) => event.name === "RepositoryInvitationDeclined",
    ),
    true,
  );
  strict.equal(
    byPath.get("repositories/repository-access").publishedEvents.some(
      (event) => event.name === "RepositoryInvitationPermissionChanged",
    ),
    true,
  );
  strict.match(
    byPath.get("repositories/repositories").semanticClaims.find(
      (claim) => claim.id === "repository-transfer",
    ).statement,
    /personal account/,
  );
  strict.equal(
    byPath.get("repositories/repository-metadata").semanticStatus,
    "validated",
  );
  strict.deepEqual(
    byPath.get("repositories/repository-metadata").semanticClaims.map((claim) => claim.id),
    ["repository-topic-set", "repository-social-preview"],
  );
  strict.equal(
    byPath.get("integrations/repository-autolinks").publishedEvents.some(
      (event) => event.name === "RepositoryAutolinkUpdated",
    ),
    false,
  );
  strict.equal(
    byPath.get("collaboration/discussions").publishedEvents.some(
      (event) => event.name === "OrganizationDiscussionSourceUnavailable",
    ),
    false,
  );
  strict.match(
    byPath.get("integrations/repository-autolinks").semanticClaims.find(
      (claim) => claim.id === "repository-autolink-definition",
    ).statement,
    /non-overlapping prefix/,
  );
  const discussionEvents = new Set(
    byPath.get("collaboration/discussions").publishedEvents.map((event) => event.name),
  );
  for (const event of [
    "DiscussionDeleted",
    "DiscussionSectionCreated",
    "DiscussionSectionUpdated",
    "DiscussionSectionDeleted",
  ]) {
    strict.equal(discussionEvents.has(event), true);
  }
  strict.equal(discussionEvents.has("DiscussionPollClosed"), false);
  const discussionSourceUrls = new Set(
    byPath.get("collaboration/discussions").officialSources.map((source) => source.url),
  );
  for (const sourceUrl of [
    "https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions",
    "https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions",
    "https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion",
    "https://docs.github.com/en/graphql/reference/discussions",
  ]) {
    strict.equal(discussionSourceUrls.has(sourceUrl), true);
  }
  strict.equal(
    byPath.get("integrations/github-app-installations").officialSources.some(
      (source) => source.url.endsWith("/approving-updated-permissions-for-a-github-app"),
    ),
    true,
  );
  strict.match(
    byPath.get("integrations/github-app-installations").semanticClaims.find(
      (claim) => claim.id === "github-app-installation-permission-approval",
    ).statement,
    /retains its current permissions/,
  );
  for (const capability of [
    "git-backed-repository-wiki-content",
    "repository-migration-locks",
    "organization-discussion-source-repository-disruption",
  ]) {
    strict.equal(
      catalog.deferredCapabilities.some((item) => item.name === capability),
      true,
    );
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

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-018"), true);
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
      implementationStatus: "planned",
      semanticStatus: "candidate",
      responsibility: "Search projection.",
      owns: ["SearchDocument"],
      excludes: ["Repository"],
      activationScope: [],
      dependencies: [],
      plannedRelationships: [
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
      semanticClaims: [],
    });
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-015"), true);
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
      implementationStatus: "active",
      semanticStatus: "validated",
      responsibility: "Issue tracking.",
      owns: ["Issue"],
      excludes: ["Repository"],
      activationScope: ["create-issue"],
      dependencies: [],
      plannedRelationships: [],
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
          implementationStatus: "planned",
          meaning: "issue created.",
          sourceIds: ["collaboration-issues-source-01"],
        },
      ],
      semanticClaims: [
        {
          id: "issue-lifecycle",
          statement: "Issues have identity and creation semantics.",
          ownership: ["Issue"],
          events: ["IssueCreated@1"],
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

    strict.equal(includesRule(check(rootDir), "ARCH-DEP-010"), true);

    catalog.contexts[1].plannedRelationships.push({
      context: "core-domain/repositories",
      contract: "RepositoryBrowserUi",
      mode: "synchronous",
    });
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-DEP-010"), false);
    strict.equal(includesRule(check(rootDir), "ARCH-DEP-013"), true);

    catalog.contexts[1].dependencies.push(catalog.contexts[1].plannedRelationships.pop());
    writeCatalog(rootDir, catalog);

    strict.equal(includesRule(check(rootDir), "ARCH-DEP-010"), false);
    strict.equal(includesRule(check(rootDir), "ARCH-DEP-013"), false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("allows only AGENTS.md as the src-root instruction file", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "src/AGENTS.md", "# Source instructions\n");
    strict.equal(includesRule(check(rootDir), "ARCH-SRC-001"), false);

    writeFixture(rootDir, "src/README.md", "# Unsupported source-root file\n");
    strict.equal(includesRule(check(rootDir), "ARCH-SRC-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects a third src root", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "src/lib/utility.ts", "export const value = 1;\n");
    strict.equal(includesRule(check(rootDir), "ARCH-SRC-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("allows in-memory adapters only behind explicit test boundaries", () => {
  const rootDir = createValidFixture();

  try {
    const moduleRoot = "src/modules/core-domain/repositories";
    writeFixture(
      rootDir,
      `${moduleRoot}/adapters/outbound/persistence/in-memory-repository.adapter.ts`,
      "export const inMemoryRepository = {};\n",
    );
    writeFixture(
      rootDir,
      `${moduleRoot}/tests/repository.test.ts`,
      'import { inMemoryRepository } from "../adapters/outbound/persistence/in-memory-repository.adapter";\nvoid inMemoryRepository;\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-SRC-002"), false);

    writeFixture(
      rootDir,
      `${moduleRoot}/composition/repositories.composition.ts`,
      'import { inMemoryRepository } from "../adapters/outbound/persistence/in-memory-repository.adapter";\nexport const repositories = inMemoryRepository;\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-SRC-002"), true);
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
    strict.equal(includesRule(check(rootDir), "ARCH-TOOL-001"), true);
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
    strict.equal(includesRule(check(rootDir), "ARCH-GRAPH-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires server-only markers for direct server capabilities", () => {
  const rootDir = createValidFixture();
  const adapterPath =
    "src/modules/core-domain/repositories/adapters/outbound/runtime/node-id.adapter.ts";

  try {
    writeFixture(
      rootDir,
      adapterPath,
      'import { randomUUID } from "node:crypto";\nexport function createId(): string { return randomUUID(); }\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-SERVER-001"), true);

    writeFixture(
      rootDir,
      adapterPath,
      'import "server-only";\nimport { randomUUID } from "node:crypto";\nexport function createId(): string { return randomUUID(); }\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-SERVER-001"), false);
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
    strict.equal(includesRule(check(rootDir), "ARCH-CLIENT-001"), true);
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
    strict.equal(includesRule(errors, "ARCH-NAME-002"), true);
    strict.equal(includesRule(errors, "ARCH-FILE-001"), true);
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
    strict.equal(includesRule(errors, "ARCH-NAME-003"), true);
    strict.equal(includesRule(errors, "ARCH-NAME-004"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires semantic context to use-case to function traceability", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/application/commands/create-repository.handler.ts",
      'import type { CreateRepositoryUseCase } from "../ports/inbound/create-repository.use-case";\nexport class CreateRepositoryHandler implements CreateRepositoryUseCase { async execute(): Promise<void> {} }\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-001"), true);

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/application/commands/create-repository.handler.ts",
      'import type { CreateRepositoryUseCase } from "../ports/inbound/create-repository.use-case";\nexport class CreateRepositoryHandler implements CreateRepositoryUseCase { async createRepository(): Promise<void> {} }\n',
    );
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-001"), false);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires every designed-use-case field", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        "- **Authorization:** Repository creation policy.\n",
        "",
      ),
    );

    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires active designs to match activation scope and handler type", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        "### `create-repository` [active]",
        "### `create-repository` [planned]",
      ),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), true);

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace("- **Type:** `command`", "- **Type:** `query`"),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), true);

    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        "`CreateRepositoryUseCase.createRepository()`",
        "`CreateRepositoryUseCase.execute()`",
      ),
    );
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects handlers without an approved active design", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        /## Designed use cases[\s\S]*?## Ubiquitous language/,
        "## Designed use cases\n\nNo approved use cases. Implementation remains blocked.\n\n## Ubiquitous language",
      ),
    );

    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects inbound ports for planned designed use cases", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        "### `create-repository` [active]",
        "### `create-repository` [planned]",
      ),
    );
    const catalog = validCatalog();
    catalog.contexts[0].activationScope = [];
    writeCatalog(rootDir, catalog);
    rmSync(
      join(
        rootDir,
        "src",
        "modules",
        "core-domain",
        "repositories",
        "application",
        "commands",
        "create-repository.handler.ts",
      ),
    );

    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires designed rejection literals in the inbound result", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      readme.replace(
        "- **Expected rejections:** `none`",
        "- **Expected rejections:** `repository-name-conflict`",
      ),
    );

    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-003"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects uncataloged designed-use-case references", () => {
  const rootDir = createValidFixture();

  try {
    const readmePath = join(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
    );
    const readme = readFileSync(readmePath, "utf8");

    for (const [current, replacement] of [
      [
        "- **Dependencies:** `none`",
        "- **Dependencies:** `identity/accounts::AccountReference`",
      ],
      [
        "- **Published events:** `RepositoryCreated@1`",
        "- **Published events:** `RepositoryDeleted@1`",
      ],
      [
        "- **Official evidence:** `core-domain-repositories-source-01`",
        "- **Official evidence:** `missing-source`",
      ],
    ]) {
      writeFixture(
        rootDir,
        "src/modules/core-domain/repositories/README.md",
        readme.replace(current, replacement),
      );
      strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);
    }
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
    strict.equal(includesRule(check(rootDir), "ARCH-STRUCT-002"), true);
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
    strict.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-007"), true);

    const registry = [
      {
        id: "ARCH-EX-001",
        rule: "ARCH-DEP-006",
        scope: buttonPath,
        owner: "platform-team",
        approvedOn: "2026-07-01",
        expiresOn: "2026-07-21",
        reason: "Vendor constraint.",
        alternatives: "No compatible alternative.",
        risk: "Temporary coupling.",
        spreadPrevention: "Exact file scope.",
        removalCondition: "Remove after vendor migration.",
      },
    ];
    writeFixture(
      rootDir,
      "docs/architecture/exceptions/registry.json",
      `${JSON.stringify(registry, null, 2)}\n`,
    );
    strict.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-006"), true);

    registry[0].approvedOn = "2027-07-01";
    registry[0].expiresOn = "2027-07-21";
    writeFixture(
      rootDir,
      "docs/architecture/exceptions/registry.json",
      `${JSON.stringify(registry, null, 2)}\n`,
    );
    strict.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-005"), true);

    registry[0].approvedOn = "2026-07-01";
    registry[0].expiresOn = "2027-07-21";
    registry[0].scope = "src/modules/core-domain/repositories/browser-ui.ts";
    writeFixture(
      rootDir,
      "docs/architecture/exceptions/registry.json",
      `${JSON.stringify(registry, null, 2)}\n`,
    );
    strict.equal(includesRule(check(rootDir), "ARCH-EXCEPTION-008"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects a stale generated module map", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "docs/architecture/module-map.md", "# stale\n");
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-012"), false);
    strict.equal(
      includesRule(check(rootDir, "generated"), "ARCH-MAP-012"),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("requires a README-owned directory for every planned context", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts[0].implementationStatus = "planned";
    catalog.contexts[0].activationScope = [];
    writeCatalog(rootDir, catalog);
    rmSync(
      join(rootDir, "src", "modules", "core-domain", "repositories"),
      { recursive: true, force: true },
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-027"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("allows only README.md in planned context directories", () => {
  const rootDir = createValidFixture();

  try {
    const catalog = validCatalog();
    catalog.contexts.push({
      subdomain: "platform",
      name: "event-publication",
      kind: "technical",
      classification: "generic",
      maturity: "stable",
      implementationStatus: "planned",
      semanticStatus: "not-applicable",
      responsibility: "Publish integration events.",
      owns: ["EventPublication"],
      excludes: ["ProductPolicy"],
      activationScope: [],
      dependencies: [],
      plannedRelationships: [],
      semanticClaims: [],
      officialSources: [],
      publishedEvents: [],
      eventRationale: "Technical infrastructure does not publish product events.",
    });
    writeCatalog(rootDir, catalog);
    const plannedReadme = readFileSync(
      join(rootDir, "src", "modules", "platform", "event-publication", "README.md"),
      "utf8",
    );
    strict.match(plannedReadme, /## Ownership and invariants/);
    strict.match(plannedReadme, /## Dependencies and consistency/);
    strict.doesNotMatch(plannedReadme, /## Authorization/);
    strict.doesNotMatch(plannedReadme, /## Retention and erasure/);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-006"), false);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-027"), false);
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), false);
    strict.equal(includesRule(check(rootDir), "ARCH-USECASE-002"), false);

    writeFixture(
      rootDir,
      "src/modules/platform/event-publication/README.md",
      `${plannedReadme}
## Ubiquitous language

No additional terms.

## Public capabilities

No active capabilities.

## Authorization

Not applicable while planned.

## Persistence and transactions

Not applicable while planned.

## Data classification

Not applicable while planned.

## Retention and erasure

Not applicable while planned.

## Events and failure behavior

No active events.
`,
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-019"), true);

    writeFixture(
      rootDir,
      "src/modules/platform/event-publication/README.md",
      plannedReadme,
    );

    writeFixture(
      rootDir,
      "src/modules/platform/event-publication/server-api.ts",
      "export {};\n",
    );
    strict.equal(includesRule(check(rootDir), "ARCH-MAP-006"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects broken nested AGENTS links and permanent overrides", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "apps/web/AGENTS.md", "# Web\n\n[missing](missing.md)\n");
    writeFixture(rootDir, "apps/web/AGENTS.override.md", "# Override\n");

    strict.equal(includesRule(check(rootDir), "ARCH-GUIDE-001"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects model-version startup boilerplate in guidance", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "README.md",
      "# Fixture\n\nFor Codex 5.3 startup, read every guide.\n",
    );

    strict.equal(includesRule(check(rootDir), "ARCH-GUIDE-003"), true);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("reports inherited AGENTS paragraph duplication as knowledge", () => {
  const rootDir = createValidFixture();
  const repeatedParagraph =
    "This intentionally repeated guidance paragraph is long enough to represent a meaningful inherited rule and should be owned by one ancestor only.";

  try {
    writeFixture(rootDir, "AGENTS.md", `# Root\n\n${repeatedParagraph}\n`);
    writeFixture(
      rootDir,
      "apps/AGENTS.md",
      `# Applications\n\n${repeatedParagraph}\n`,
    );

    strict.equal(
      includesRule(check(rootDir, "knowledge"), "ARCH-GUIDE-004"),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("reports guidance token budget excess as knowledge", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(rootDir, "AGENTS.md", `# Root\n\n${"x".repeat(4_801)}\n`);

    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith("AGENTS.md is estimated");
      }),
      true,
    );

    writeFixture(rootDir, "AGENTS.md", "# Root\n");
    writeFixture(
      rootDir,
      "apps/AGENTS.md",
      `# Applications\n\n${"x".repeat(12_001)}\n`,
    );
    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith(
            "AGENTS chain ending at apps/AGENTS.md",
          );
      }),
      true,
    );
    writeFixture(rootDir, "apps/AGENTS.md", "# Applications\n");

    writeFixture(
      rootDir,
      "packages/AGENTS.md",
      `# Packages\n\n${"x".repeat(8_001)}\n`,
    );
    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith(
            "AGENTS chain ending at packages/AGENTS.md",
          );
      }),
      true,
    );
    writeFixture(rootDir, "packages/AGENTS.md", "# Packages\n");

    writeFixture(rootDir, "README.md", `# Root\n\n${"x".repeat(7_201)}\n`);
    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith("README.md is estimated");
      }),
      true,
    );

    writeFixture(
      rootDir,
      "apps/web/src/app/example/README.md",
      `# Route\n\n${"x".repeat(4_801)}\n`,
    );
    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith("Route README");
      }),
      true,
    );

    const catalog = validCatalog();
    catalog.contexts[0].implementationStatus = "planned";
    catalog.contexts[0].activationScope = [];
    writeCatalog(rootDir, catalog);
    writeFixture(
      rootDir,
      "src/modules/core-domain/repositories/README.md",
      `# Planned\n\n${"x".repeat(12_001)}\n`,
    );
    strict.equal(
      check(rootDir, "knowledge").some((violation) => {
        return violation.ruleId === "ARCH-GUIDE-005" &&
          violation.message.startsWith("Planned context README");
      }),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
