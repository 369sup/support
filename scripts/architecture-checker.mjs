import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import ts from "typescript";

const sourceExtensions = [".ts", ".tsx", ".mts", ".cts"];
const publicEntrypoints = new Set([
  "server-api.ts",
  "browser-ui.ts",
  "server-actions.ts",
  "integration-contracts.ts",
]);
const vagueBasenames = new Set([
  "base",
  "action",
  "actions",
  "client",
  "common",
  "constants",
  "handlers",
  "helper",
  "helpers",
  "interfaces",
  "manager",
  "misc",
  "models",
  "processor",
  "public",
  "server",
  "service",
  "shared",
  "types",
  "utils",
]);
const exceptionFields = [
  "id",
  "rule",
  "scope",
  "owner",
  "reason",
  "alternatives",
  "risk",
  "spreadPrevention",
  "reviewAfter",
  "removalCondition",
];
const contextLayers = new Set([
  "domain",
  "application",
  "contracts",
  "adapters",
  "composition",
  "tests",
]);

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
}

function listFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isSourceFile(filePath) {
  return (
    sourceExtensions.some((extension) => filePath.endsWith(extension)) &&
    !filePath.endsWith(".d.ts")
  );
}

function readJson(filePath, errors, ruleId) {
  if (!existsSync(filePath)) {
    errors.push(`${ruleId} Missing ${normalizePath(filePath)}.`);
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`${ruleId} Invalid JSON in ${normalizePath(filePath)}: ${message}`);
    return undefined;
  }
}

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}

function contextRootFor(rootDir, context) {
  return join(rootDir, "src", "modules", context.subdomain, context.name);
}

function validateSourceRoot(rootDir, errors) {
  const sourceRoot = join(rootDir, "src");

  if (!existsSync(sourceRoot)) {
    errors.push("[ARCH-SRC-001] Missing src directory.");
    return;
  }

  for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || (entry.name !== "app" && entry.name !== "modules")) {
      errors.push(
        `[ARCH-SRC-001] src may contain only the app and modules directories; found src/${entry.name}.`,
      );
    }
  }
}

function validateToolAliases(repositoryRoot, applicationRoot, errors) {
  const applicationComponentsPath = join(applicationRoot, "components.json");

  if (existsSync(applicationComponentsPath)) {
    errors.push(
      "[ARCH-TOOL-001] apps/web/components.json is prohibited; shadcn is configured only by packages/shadcn/components.json.",
    );
  }

  const shadcnRoot = join(repositoryRoot, "packages", "shadcn");

  if (!existsSync(shadcnRoot)) {
    return;
  }

  const componentsPath = join(shadcnRoot, "components.json");

  if (!existsSync(componentsPath)) {
    errors.push(
      "[ARCH-TOOL-001] Missing packages/shadcn/components.json.",
    );
    return;
  }

  const configuration = readJson(
    componentsPath,
    errors,
    "[ARCH-TOOL-001]",
  );

  if (configuration === undefined) {
    return;
  }

  const expectedAliases = {
    components: "@support/shadcn/custom",
    utils: "@support/shadcn/lib/class-names",
    ui: "@support/shadcn/ui",
    lib: "@support/shadcn/lib",
    hooks: "@support/shadcn/hooks",
  };

  for (const [name, expected] of Object.entries(expectedAliases)) {
    if (configuration.aliases?.[name] !== expected) {
      errors.push(
        `[ARCH-TOOL-001] components.json alias ${name} must be ${expected}.`,
      );
    }
  }
}

function validateCatalog(rootDir, catalog, errors) {
  if (!Array.isArray(catalog?.contexts)) {
    errors.push("[ARCH-MAP-001] module-map.json must contain a contexts array.");
    return new Map();
  }

  const contextsByPath = new Map();

  for (const context of catalog.contexts) {
    const contextPath = `${context.subdomain}/${context.name}`;

    if (!isKebabCase(context.subdomain) || !isKebabCase(context.name)) {
      errors.push(`[ARCH-MAP-002] Context path must be kebab-case: ${contextPath}.`);
    }

    if (contextsByPath.has(contextPath)) {
      errors.push(`[ARCH-MAP-003] Duplicate context in module-map.json: ${contextPath}.`);
    }

    contextsByPath.set(contextPath, context);

    if (context.status !== "planned" && context.status !== "active") {
      errors.push(`[ARCH-MAP-004] ${contextPath} has invalid status ${context.status}.`);
    }

    if (context.kind === "product") {
      if (
        !Array.isArray(context.officialSources) ||
        context.officialSources.length === 0 ||
        context.officialSources.some((source) => {
          try {
            return new URL(source).hostname !== "docs.github.com";
          } catch {
            return true;
          }
        })
      ) {
        errors.push(
          `[ARCH-MAP-005] Product context ${contextPath} requires at least one docs.github.com source and no third-party sources.`,
        );
      }
    }

    const contextRoot = contextRootFor(rootDir, context);

    if (context.status === "planned" && existsSync(contextRoot)) {
      errors.push(
        `[ARCH-MAP-006] Planned context ${contextPath} must not have a source directory. Mark it active when implementation begins.`,
      );
    }

    if (context.status === "active") {
      if (!existsSync(contextRoot)) {
        errors.push(`[ARCH-MAP-007] Active context ${contextPath} is missing.`);
        continue;
      }

      if (!existsSync(join(contextRoot, "README.md"))) {
        errors.push(`[ARCH-MAP-008] Active context ${contextPath} requires README.md.`);
      }

      const hasEntrypoint = [...publicEntrypoints].some((entrypoint) => {
        return existsSync(join(contextRoot, entrypoint));
      });

      if (!hasEntrypoint) {
        errors.push(
          `[ARCH-MAP-009] Active context ${contextPath} requires at least one public root entrypoint.`,
        );
      }
    }
  }

  const modulesRoot = join(rootDir, "src", "modules");

  if (!existsSync(modulesRoot)) {
    return contextsByPath;
  }

  for (const subdomainEntry of readdirSync(modulesRoot, { withFileTypes: true })) {
    if (!subdomainEntry.isDirectory()) {
      if (subdomainEntry.name !== "AGENTS.md") {
        errors.push(
          `[ARCH-STRUCT-001] src/modules root may contain only AGENTS.md and subdomain directories; found ${subdomainEntry.name}.`,
        );
      }

      continue;
    }

    const subdomainRoot = join(modulesRoot, subdomainEntry.name);

    for (const contextEntry of readdirSync(subdomainRoot, { withFileTypes: true })) {
      if (!contextEntry.isDirectory()) {
        if (contextEntry.name !== "README.md") {
          errors.push(
            `[ARCH-STRUCT-002] Subdomain ${subdomainEntry.name} may contain only README.md and bounded-context directories; found ${contextEntry.name}.`,
          );
        }

        continue;
      }

      const contextPath = `${subdomainEntry.name}/${contextEntry.name}`;
      const catalogContext = contextsByPath.get(contextPath);

      if (catalogContext?.status !== "active") {
        errors.push(
          `[ARCH-MAP-010] Source context ${contextPath} must be declared active in module-map.json.`,
        );
      }

      const contextRoot = join(subdomainRoot, contextEntry.name);

      for (const contextRootEntry of readdirSync(contextRoot, {
        withFileTypes: true,
      })) {
        const isAllowedDirectory =
          contextRootEntry.isDirectory() &&
          contextLayers.has(contextRootEntry.name);
        const isAllowedFile =
          contextRootEntry.isFile() &&
          (contextRootEntry.name === "README.md" ||
            publicEntrypoints.has(contextRootEntry.name));

        if (!isAllowedDirectory && !isAllowedFile) {
          errors.push(
            `[ARCH-STRUCT-003] ${contextPath} root contains unsupported entry ${contextRootEntry.name}.`,
          );
        }
      }
    }
  }

  return contextsByPath;
}

function roleLocationError(relativePath) {
  const checks = [
    [/\.aggregate\.[cm]?tsx?$/, "/domain/aggregates/"],
    [/\.entity\.[cm]?tsx?$/, "/domain/entities/"],
    [/\.value-object\.[cm]?tsx?$/, "/domain/value-objects/"],
    [/\.domain-service\.[cm]?tsx?$/, "/domain/services/"],
    [/\.policy\.[cm]?tsx?$/, "/domain/policies/"],
    [/\.domain-event\.[cm]?tsx?$/, "/domain/events/"],
    [/\.domain-error\.[cm]?tsx?$/, "/domain/errors/"],
    [/\.use-case\.[cm]?tsx?$/, "/application/ports/inbound/"],
    [/(?:\.repository|\.gateway)\.port\.[cm]?tsx?$/, "/application/ports/outbound/"],
    [/\.adapter\.[cm]?tsx?$/, "/adapters/"],
    [/\.mapper\.[cm]?tsx?$/, "/mappers/"],
  ];

  for (const [pattern, requiredPath] of checks) {
    if (pattern.test(relativePath) && !relativePath.includes(requiredPath)) {
      return requiredPath;
    }
  }

  if (/\.handler\.[cm]?tsx?$/.test(relativePath)) {
    const isApplicationHandler =
      relativePath.includes("/application/commands/") ||
      relativePath.includes("/application/queries/");
    const isRouteHandler = relativePath.includes(
      "/adapters/inbound/next/route-handlers/",
    );

    if (!isApplicationHandler && !isRouteHandler) {
      return "an application command/query or Next route-handlers directory";
    }
  }

  return undefined;
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function runtimeExportCount(sourceFile) {
  let count = 0;

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly || statement.exportClause === undefined) {
        continue;
      }

      if (ts.isNamedExports(statement.exportClause)) {
        count += statement.exportClause.elements.filter((element) => {
          return !element.isTypeOnly;
        }).length;
      }

      continue;
    }

    if (!hasExportModifier(statement)) {
      continue;
    }

    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      count += statement.declarationList.declarations.length;
    } else {
      count += 1;
    }
  }

  return count;
}

function validateModuleNamesAndRoles(rootDir, sourceFiles, errors) {
  const modulesRoot = join(rootDir, "src", "modules");

  if (!existsSync(modulesRoot)) {
    return;
  }

  for (const entry of readdirSync(modulesRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !isKebabCase(entry.name)) {
      errors.push(`[ARCH-NAME-001] Subdomain must be kebab-case: ${entry.name}.`);
    }
  }

  for (const filePath of sourceFiles) {
    const relativePath = projectRelative(rootDir, filePath);

    if (!relativePath.startsWith("src/modules/")) {
      continue;
    }

    const contextRelative = relativePath.split("/").slice(4).join("/");
    const filename = relativePath.split("/").at(-1);
    const basename = filename.replace(/\.(?:[cm]?ts|tsx)$/, "");
    const stem = basename.replace(/\.(?:spec|test)$/, "");
    const contextSegments = contextRelative.split("/");
    const directorySegments = contextSegments.slice(0, -1);
    const isKebabRoleFilename =
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*\.(?:[cm]?ts|tsx)$/.test(
        filename,
      );

    if (
      directorySegments.some((segment) => !isKebabCase(segment)) ||
      !isKebabRoleFilename
    ) {
      errors.push(
        `[ARCH-NAME-001] Module directories and source filenames must use kebab-case: ${relativePath}.`,
      );
    }

    if (vagueBasenames.has(stem)) {
      errors.push(`[ARCH-NAME-002] Ambiguous filename is prohibited: ${relativePath}.`);
    }

    if (filename === "index.ts" && contextRelative !== "index.ts") {
      errors.push(`[ARCH-NAME-003] Nested barrel index.ts is prohibited: ${relativePath}.`);
    }

    if (filename === "index.ts" || /\.action\.[cm]?tsx?$/.test(filename)) {
      errors.push(
        `[ARCH-NAME-005] Ambiguous module API filename is prohibited: ${relativePath}. Use an explicit public entrypoint or *.server-action.ts.`,
      );
    }

    const requiredPath = roleLocationError(`/${contextRelative}`);

    if (requiredPath !== undefined) {
      errors.push(
        `[ARCH-NAME-004] ${relativePath} must be located in ${requiredPath}.`,
      );
    }

    const isPublicEntrypoint =
      contextRelative !== "" &&
      !contextRelative.includes("/") &&
      publicEntrypoints.has(filename);
    const isTest = /\.(?:spec|test)\.[cm]?tsx?$/.test(filename);

    if (!isPublicEntrypoint && !isTest) {
      const sourceFile = ts.createSourceFile(
        filePath,
        readFileSync(filePath, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );

      if (runtimeExportCount(sourceFile) > 1) {
        errors.push(
          `[ARCH-FILE-001] ${relativePath} exports more than one runtime symbol. Split architectural responsibilities.`,
        );
      }
    }
  }
}

function moduleSpecifiers(sourceFile) {
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function resolveSourceImport(rootDir, importer, specifier) {
  let basePath;

  if (specifier.startsWith("@/")) {
    basePath = join(rootDir, "src", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    basePath = resolve(dirname(importer), specifier);
  } else {
    return undefined;
  }

  const candidates = [
    basePath,
    ...sourceExtensions.map((extension) => `${basePath}${extension}`),
    ...sourceExtensions.map((extension) => join(basePath, `index${extension}`)),
  ];

  return candidates.find((candidate) => {
    return existsSync(candidate) && statSync(candidate).isFile();
  });
}

function containsProcessEnvironment(sourceFile) {
  let found = false;

  function visit(node) {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "process" &&
      node.name.text === "env"
    ) {
      found = true;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

function buildGraph(rootDir, sourceFiles) {
  const graph = new Map();
  const metadata = new Map();

  for (const filePath of sourceFiles) {
    const sourceFile = ts.createSourceFile(
      filePath,
      readFileSync(filePath, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const specifiers = moduleSpecifiers(sourceFile);
    const localDependencies = specifiers
      .map((specifier) => resolveSourceImport(rootDir, filePath, specifier))
      .filter((dependency) => dependency !== undefined);

    graph.set(filePath, localDependencies);
    metadata.set(filePath, {
      hasProcessEnvironment: containsProcessEnvironment(sourceFile),
      externalSpecifiers: specifiers.filter((specifier) => {
        return !specifier.startsWith("@/") && !specifier.startsWith(".");
      }),
    });
  }

  return { graph, metadata };
}

function validateCycles(rootDir, graph, errors) {
  const states = new Map();
  const stack = [];
  const reported = new Set();

  function visit(filePath) {
    states.set(filePath, "visiting");
    stack.push(filePath);

    for (const dependency of graph.get(filePath) ?? []) {
      const state = states.get(dependency);

      if (state === "visiting") {
        const cycleStart = stack.indexOf(dependency);
        const cycle = [...stack.slice(cycleStart), dependency].map((entry) => {
          return projectRelative(rootDir, entry);
        });
        const signature = cycle.join(" -> ");

        if (!reported.has(signature)) {
          errors.push(`[ARCH-GRAPH-001] Circular dependency: ${signature}.`);
          reported.add(signature);
        }
      } else if (state === undefined) {
        visit(dependency);
      }
    }

    stack.pop();
    states.set(filePath, "visited");
  }

  for (const filePath of graph.keys()) {
    if (states.get(filePath) === undefined) {
      visit(filePath);
    }
  }
}

function validateClientGraphs(rootDir, graph, metadata, errors) {
  const clientEntrypoints = [...graph.keys()].filter((filePath) => {
    const relativePath = projectRelative(rootDir, filePath);
    return /^src\/modules\/[^/]+\/[^/]+\/browser-ui\.ts$/.test(relativePath);
  });

  for (const clientEntrypoint of clientEntrypoints) {
    const visited = new Set();
    const pending = [clientEntrypoint];

    while (pending.length > 0) {
      const filePath = pending.pop();

      if (visited.has(filePath)) {
        continue;
      }

      visited.add(filePath);
      const relativePath = projectRelative(rootDir, filePath);
      const fileMetadata = metadata.get(filePath);
      const reachesServerLayer =
        relativePath.includes("/composition/") ||
        relativePath.includes("/adapters/outbound/") ||
        relativePath.includes("/application/");
      const importsServerPackage = fileMetadata.externalSpecifiers.some((specifier) => {
        return specifier === "server-only" || specifier.startsWith("node:");
      });

      if (
        reachesServerLayer ||
        importsServerPackage ||
        fileMetadata.hasProcessEnvironment
      ) {
        errors.push(
          `[ARCH-CLIENT-001] ${projectRelative(rootDir, clientEntrypoint)} reaches server-only dependency ${relativePath}.`,
        );
      }

      pending.push(...(graph.get(filePath) ?? []));
    }
  }
}

function validateExceptions(rootDir, registry, sourceFiles, now, errors) {
  if (!Array.isArray(registry)) {
    errors.push("[ARCH-EXCEPTION-001] exceptions/registry.json must contain an array.");
    return;
  }

  const registryById = new Map();

  for (const exception of registry) {
    const missingFields = exceptionFields.filter((field) => {
      return typeof exception[field] !== "string" || exception[field].trim() === "";
    });

    if (missingFields.length > 0) {
      errors.push(
        `[ARCH-EXCEPTION-002] Architecture exception is missing: ${missingFields.join(", ")}.`,
      );
      continue;
    }

    if (!/^ARCH-EX-\d{3}$/.test(exception.id)) {
      errors.push(`[ARCH-EXCEPTION-003] Invalid exception id ${exception.id}.`);
    }

    if (registryById.has(exception.id)) {
      errors.push(`[ARCH-EXCEPTION-004] Duplicate exception id ${exception.id}.`);
    }

    registryById.set(exception.id, exception);

    const today = now.toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.reviewAfter)) {
      errors.push(
        `[ARCH-EXCEPTION-005] ${exception.id} reviewAfter must use YYYY-MM-DD.`,
      );
    } else if (exception.reviewAfter <= today) {
      errors.push(
        `[ARCH-EXCEPTION-006] ${exception.id} reached its review date ${exception.reviewAfter}.`,
      );
    }
  }

  const references = new Map();

  for (const filePath of sourceFiles) {
    const contents = readFileSync(filePath, "utf8");

    for (const match of contents.matchAll(/ARCH-EX-\d{3}/g)) {
      const id = match[0];
      const paths = references.get(id) ?? [];
      paths.push(projectRelative(rootDir, filePath));
      references.set(id, paths);
    }
  }

  for (const [id, paths] of references) {
    const exception = registryById.get(id);

    if (exception === undefined) {
      errors.push(`[ARCH-EXCEPTION-007] ${id} is referenced but not registered.`);
      continue;
    }

    for (const referencePath of paths) {
      const normalizedScope = normalizePath(exception.scope).replace(/\/$/, "");

      if (
        referencePath !== normalizedScope &&
        !referencePath.startsWith(`${normalizedScope}/`)
      ) {
        errors.push(
          `[ARCH-EXCEPTION-008] ${id} scope ${normalizedScope} does not cover ${referencePath}.`,
        );
      }
    }
  }

  for (const id of registryById.keys()) {
    if (!references.has(id)) {
      errors.push(`[ARCH-EXCEPTION-009] Registered exception ${id} is not referenced.`);
    }
  }
}

export function renderModuleMap(catalog) {
  const lines = [
    "<!-- Generated from module-map.json. Do not edit directly. -->",
    "# Module Map",
    "",
    "| Subdomain | Bounded context | Kind | Status | Responsibility |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const context of catalog.contexts) {
    lines.push(
      `| ${context.subdomain} | ${context.name} | ${context.kind} | ${context.status} | ${context.responsibility} |`,
    );
  }

  lines.push(
    "",
    "Product semantics must be justified by the official GitHub documentation URLs recorded in `module-map.json`.",
    "Planned contexts do not receive source directories until implementation begins.",
    "",
  );

  return lines.join("\n");
}

function validateGeneratedModuleMap(rootDir, catalog, errors) {
  const markdownPath = join(rootDir, "docs", "architecture", "module-map.md");

  if (!existsSync(markdownPath)) {
    errors.push("[ARCH-MAP-011] Missing generated docs/architecture/module-map.md.");
    return;
  }

  const expected = renderModuleMap(catalog);
  const actual = readFileSync(markdownPath, "utf8").replaceAll("\r\n", "\n");

  if (actual !== expected) {
    errors.push(
      "[ARCH-MAP-012] module-map.md is stale; regenerate it from module-map.json.",
    );
  }
}

export function runArchitectureChecks({
  repositoryRoot,
  applicationRoot,
  now = new Date(),
}) {
  const errors = [];
  const sourceRoot = join(applicationRoot, "src");
  const sourceFiles = listFiles(sourceRoot).filter(isSourceFile);
  const catalogPath = join(repositoryRoot, "docs", "architecture", "module-map.json");
  const registryPath = join(
    repositoryRoot,
    "docs",
    "architecture",
    "exceptions",
    "registry.json",
  );

  validateSourceRoot(applicationRoot, errors);
  validateToolAliases(repositoryRoot, applicationRoot, errors);

  const catalog = readJson(catalogPath, errors, "[ARCH-MAP-001]");

  if (catalog !== undefined) {
    validateCatalog(applicationRoot, catalog, errors);
    validateGeneratedModuleMap(repositoryRoot, catalog, errors);
  }

  validateModuleNamesAndRoles(applicationRoot, sourceFiles, errors);

  const { graph, metadata } = buildGraph(applicationRoot, sourceFiles);
  validateCycles(applicationRoot, graph, errors);
  validateClientGraphs(applicationRoot, graph, metadata, errors);

  const registry = readJson(
    registryPath,
    errors,
    "[ARCH-EXCEPTION-001]",
  );

  if (registry !== undefined) {
    validateExceptions(applicationRoot, registry, sourceFiles, now, errors);
  }

  return errors;
}
