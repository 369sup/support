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

import {
  deriveSupportPath,
  discoverAppRoutes,
  generateRouteArtifacts,
  renderRouteContracts,
  validateRouteCatalog,
} from "./routes.mjs";

function writeFixture(rootDir, relativePath, contents) {
  const filePath = join(rootDir, ...relativePath.split("/"));
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, contents, "utf8");
}

function validRoute() {
  return {
    id: "page-example-id",
    file: "apps/web/src/app/example/[id]/page.tsx",
    readme: "apps/web/src/app/example/[id]/README.md",
    kind: "page",
    supportPath: "/example/{id}",
    githubUrls: [],
    status: "active",
    materialization: "active",
    title: "Example",
    summary: "Delivers one example through its public query boundary.",
    pageFunction: "ExamplePage",
    pathParams: [{ name: "id", kind: "scalar" }],
    queryParams: [
      {
        name: "view",
        required: false,
        repeatable: false,
        default: "summary",
      },
      {
        name: "provider_flow_id",
        required: false,
        repeatable: false,
      },
    ],
    modules: [
      {
        context: "core/example",
        role: "owner",
        useCases: ["get-example"],
        functions: ["getExample"],
      },
    ],
    sourceIds: ["repository-app-router"],
  };
}

function createValidFixture() {
  const rootDir = mkdtempSync(join(tmpdir(), "support-routes-"));
  const catalog = {
    version: 1,
    sources: [
      {
        id: "repository-app-router",
        kind: "repository",
        path: "apps/web/src/app",
        supports: ["fixture route delivery"],
      },
    ],
    routes: [validRoute()],
  };

  writeFixture(
    rootDir,
    "apps/web/src/app/example/[id]/page.tsx",
    [
      'import { getExample } from "@/modules/core/example/server-api";',
      "",
      "export default function ExamplePage(): null {",
      "  void getExample;",
      "  return null;",
      "}",
      "",
    ].join("\n"),
  );
  writeFixture(
    rootDir,
    "apps/web/route-map.json",
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  generateRouteArtifacts(rootDir);
  return rootDir;
}

function validate(rootDir) {
  const errors = [];
  const generatedErrors = [];
  validateRouteCatalog({
    repositoryRoot: rootDir,
    contextsByPath: new Map([["core/example", {}]]),
    designsByContext: new Map([
      ["core/example", new Map([["get-example", { name: "get-example" }]])],
    ]),
    errors,
    generatedErrors,
  });
  return { errors, generatedErrors };
}

test("derives App Router paths and excludes parallel-slot fallbacks", () => {
  assert.equal(
    deriveSupportPath(
      "apps/web/src/app/(resources)/[owner]/[repository]/tree/[...path]/page.tsx",
    ),
    "/{owner}/{repository}/tree/{*path}",
  );
  assert.equal(
    deriveSupportPath(
      "apps/web/src/app/(resources)/@modal/[...catchAll]/page.tsx",
    ),
    undefined,
  );
});

test("accepts a complete deterministic route catalog", () => {
  const rootDir = createValidFixture();

  try {
    assert.deepEqual(discoverAppRoutes(rootDir), [
      "apps/web/src/app/example/[id]/page.tsx",
    ]);
    assert.deepEqual(validate(rootDir), { errors: [], generatedErrors: [] });

    const catalog = JSON.parse(
      readFileSync(join(rootDir, "apps", "web", "route-map.json"), "utf8"),
    );
    assert.equal(
      readFileSync(
        join(
          rootDir,
          "apps",
          "web",
          "src",
          "app",
          "_route-contracts",
          "route-contracts.generated.ts",
        ),
        "utf8",
      ),
      renderRouteContracts(catalog),
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects missing coverage, function drift, and generated drift", () => {
  const rootDir = createValidFixture();

  try {
    writeFixture(
      rootDir,
      "apps/web/src/app/unmapped/page.tsx",
      "export default function UnmappedPage(): null { return null; }\n",
    );
    writeFixture(
      rootDir,
      "apps/web/src/app/example/[id]/page.tsx",
      [
        'import { getDifferentExample } from "@/modules/core/example/server-api";',
        "",
        "export default function RenamedExamplePage(): null {",
        "  void getDifferentExample;",
        "  return null;",
        "}",
        "",
      ].join("\n"),
    );
    writeFixture(
      rootDir,
      "apps/web/src/app/example/[id]/README.md",
      "# manually changed\n",
    );

    const result = validate(rootDir);
    assert.equal(
      result.errors.some((error) => error.includes("[ARCH-ROUTE-001]")),
      true,
    );
    assert.equal(
      result.errors.some((error) => error.includes("[ARCH-ROUTE-004]")),
      true,
    );
    assert.equal(
      result.errors.some((error) => error.includes("[ARCH-ROUTE-005]")),
      true,
    );
    assert.equal(
      result.generatedErrors.some((error) =>
        error.includes("[ARCH-ROUTE-008]")
      ),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

test("rejects a documented-only route that gains delivery code", () => {
  const rootDir = createValidFixture();

  try {
    const routeMapPath = join(rootDir, "apps", "web", "route-map.json");
    const catalog = JSON.parse(readFileSync(routeMapPath, "utf8"));
    catalog.routes.push({
      id: "page-documented",
      readme: "apps/web/src/app/documented/README.md",
      kind: "page",
      supportPath: "/documented",
      githubUrls: [],
      status: "planned",
      materialization: "documented-only",
      title: "Documented",
      summary: "Documents a stable future URL.",
      pageFunction: null,
      pathParams: [],
      queryParams: [],
      modules: [
        {
          context: "core/example",
          role: "owner",
          useCases: ["get-example"],
          functions: [],
        },
      ],
      sourceIds: ["repository-app-router"],
    });
    writeFileSync(routeMapPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
    generateRouteArtifacts(rootDir);
    writeFixture(
      rootDir,
      "apps/web/src/app/documented/page.tsx",
      "export default function DocumentedPage(): null { return null; }\n",
    );

    assert.equal(
      validate(rootDir).errors.some((error) =>
        error.includes("[ARCH-ROUTE-004]")
      ),
      true,
    );
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
});
