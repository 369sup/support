import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import ts from "typescript";

const routeSourceExtensions = new Set(["page.tsx", "route.ts"]);
const httpMethods = new Set([
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
]);
const routeStatuses = new Set([
  "active",
  "planned",
  "deferred",
  "excluded",
  "unowned",
  "mixed",
]);
const materializations = new Set([
  "active",
  "scaffolded",
  "documented-only",
]);
const publicModuleEntrypoints = new Set([
  "browser-ui",
  "integration-contracts",
  "server-actions",
  "server-api",
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

function routeSegmentsFromFile(relativeFile) {
  const prefix = "apps/web/src/app/";

  if (!relativeFile.startsWith(prefix)) {
    return undefined;
  }

  const segments = relativeFile.slice(prefix.length).split("/");
  const filename = segments.pop();

  if (!routeSourceExtensions.has(filename)) {
    return undefined;
  }

  if (segments.some((segment) => segment.startsWith("@"))) {
    return undefined;
  }

  return segments.filter((segment) => {
    return !(segment.startsWith("(") && segment.endsWith(")"));
  });
}

function routeSegmentToPattern(segment) {
  const optionalCatchAll = segment.match(/^\[\[\.\.\.([A-Za-z][A-Za-z0-9]*)\]\]$/);

  if (optionalCatchAll !== null) {
    return `{?*${optionalCatchAll[1]}}`;
  }

  const catchAll = segment.match(/^\[\.\.\.([A-Za-z][A-Za-z0-9]*)\]$/);

  if (catchAll !== null) {
    return `{*${catchAll[1]}}`;
  }

  const scalar = segment.match(/^\[([A-Za-z][A-Za-z0-9]*)\]$/);

  if (scalar !== null) {
    return `{${scalar[1]}}`;
  }

  return segment;
}

export function deriveSupportPath(relativeFile) {
  const segments = routeSegmentsFromFile(relativeFile);

  if (segments === undefined) {
    return undefined;
  }

  return segments.length === 0
    ? "/"
    : `/${segments.map(routeSegmentToPattern).join("/")}`;
}

export function discoverAppRoutes(repositoryRoot) {
  const appRoot = join(repositoryRoot, "apps", "web", "src", "app");

  return listFiles(appRoot)
    .map((filePath) => projectRelative(repositoryRoot, filePath))
    .filter((relativeFile) => deriveSupportPath(relativeFile) !== undefined)
    .sort();
}

function parameterSchemaFromPattern(pattern) {
  return [...pattern.matchAll(/\{(\?\*)?(\*)?([A-Za-z][A-Za-z0-9]*)\}/g)].map(
    (match) => ({
      name: match[3],
      kind: match[1] !== undefined
        ? "optional-catch-all"
        : match[2] !== undefined
          ? "catch-all"
          : "scalar",
    }),
  );
}

function parseSourceFile(filePath) {
  return ts.createSourceFile(
    filePath,
    readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function exportedDelivery(sourceFile) {
  let pageFunction;
  const methods = [];

  for (const statement of sourceFile.statements) {
    const modifiers = statement.modifiers ?? [];
    const isExported = modifiers.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    const isDefault = modifiers.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
    );

    if (
      ts.isFunctionDeclaration(statement) &&
      isExported &&
      statement.name !== undefined
    ) {
      if (isDefault) {
        pageFunction = statement.name.text;
      } else if (httpMethods.has(statement.name.text)) {
        methods.push(statement.name.text);
      }
    }

    if (
      ts.isVariableStatement(statement) &&
      isExported
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          httpMethods.has(declaration.name.text)
        ) {
          methods.push(declaration.name.text);
        }
      }
    }
  }

  return { methods: methods.sort(), pageFunction };
}

function importedModules(sourceFile) {
  const imports = [];

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }

    const specifier = statement.moduleSpecifier.text;
    const match = specifier.match(
      /^@\/modules\/([a-z][a-z0-9-]*)\/([a-z][a-z0-9-]*)(?:\/([^/]+))?/,
    );

    if (match === null) {
      continue;
    }

    const functions = [];
    const bindings = statement.importClause?.namedBindings;

    if (bindings !== undefined && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const importedName = (element.propertyName ?? element.name).text;

        if (
          !statement.importClause?.isTypeOnly &&
          !element.isTypeOnly &&
          /^[a-z]/.test(importedName)
        ) {
          functions.push(importedName);
        }
      }
    } else if (
      !statement.importClause?.isTypeOnly &&
      statement.importClause?.name !== undefined &&
      /^[a-z]/.test(statement.importClause.name.text)
    ) {
      functions.push(statement.importClause.name.text);
    }

    imports.push({
      context: `${match[1]}/${match[2]}`,
      entrypoint: match[3],
      functions,
    });
  }

  return imports;
}

function normalizedText(contents) {
  return contents.replaceAll("\r\n", "\n");
}

function routeMapPath(repositoryRoot) {
  return join(repositoryRoot, "apps", "web", "route-map.json");
}

function generatedContractsPath(repositoryRoot) {
  return join(
    repositoryRoot,
    "apps",
    "web",
    "src",
    "app",
    "_route-contracts",
    "route-contracts.generated.ts",
  );
}

export function readRouteCatalog(repositoryRoot) {
  return JSON.parse(readFileSync(routeMapPath(repositoryRoot), "utf8"));
}

function routeDefinitionForRuntime(route) {
  return {
    id: route.id,
    kind: route.kind,
    supportPath: route.supportPath,
    status: route.status,
    materialization: route.materialization,
    pathParams: route.pathParams,
    queryParams: route.queryParams.map((parameter) => ({
      name: parameter.name,
      isRequired: parameter.required,
      isRepeatable: parameter.repeatable,
      ...(parameter.default === undefined
        ? {}
        : { default: parameter.default }),
    })),
  };
}

function renderTypeProperties(parameters, valueType) {
  if (parameters.length === 0) {
    return "Readonly<Record<never, never>>";
  }

  const properties = parameters.map((parameter) => {
    const optional = parameter.required === false ? "?" : "";
    const type = parameter.repeatable === true
      ? `readonly ${valueType}[]`
      : parameter.kind === "catch-all" ||
          parameter.kind === "optional-catch-all"
        ? `readonly ${valueType}[]`
        : valueType;
    return `readonly ${JSON.stringify(parameter.name)}${optional}: ${type};`;
  });

  return `Readonly<{ ${properties.join(" ")} }>`;
}

export function renderRouteContracts(catalog) {
  const routes = [...catalog.routes].sort((left, right) =>
    left.id.localeCompare(right.id)
  );
  const routeIds = routes.map((route) => JSON.stringify(route.id)).join(" | ");
  const navigableIds = routes
    .filter((route) =>
      route.kind === "page" &&
      route.materialization === "active" &&
      (route.status === "active" || route.status === "mixed")
    )
    .map((route) => JSON.stringify(route.id))
    .join(" | ");
  const unavailableIds = routes
    .filter((route) => route.materialization !== "active")
    .map((route) => JSON.stringify(route.id))
    .join(" | ");
  const params = routes.map((route) =>
    `  ${JSON.stringify(route.id)}: ${renderTypeProperties(route.pathParams, "string")};`
  );
  const queries = routes.map((route) =>
    `  ${JSON.stringify(route.id)}: ${renderTypeProperties(route.queryParams, "string")};`
  );
  const definitions = Object.fromEntries(
    routes.map((route) => [route.id, routeDefinitionForRuntime(route)]),
  );

  return `// Generated by \`pnpm architecture:docs\` from apps/web/route-map.json.
// Do not edit this file directly.

export type RouteStatus =
  | "active"
  | "planned"
  | "deferred"
  | "excluded"
  | "unowned"
  | "mixed";

export type RouteMaterialization =
  | "active"
  | "scaffolded"
  | "documented-only";

export type RouteId = ${routeIds};

export type NavigableRouteId = ${navigableIds || "never"};

export type UnavailableRouteId = ${unavailableIds || "never"};

export type RouteParamsById = Readonly<{
${params.join("\n")}
}>;

export type RouteQueryById = Readonly<{
${queries.join("\n")}
}>;

export type RouteDefinition = Readonly<{
  id: RouteId;
  kind: "page" | "handler";
  supportPath: string;
  status: RouteStatus;
  materialization: RouteMaterialization;
  pathParams: readonly Readonly<{
    name: string;
    kind: "scalar" | "catch-all" | "optional-catch-all";
  }>[];
  queryParams: readonly Readonly<{
    name: string;
    isRequired: boolean;
    isRepeatable: boolean;
    default?: string;
  }>[];
}>;

export const routeDefinitions = ${JSON.stringify(definitions, null, 2)} as const satisfies
  Readonly<Record<RouteId, RouteDefinition>>;
`;
}

function markdownList(items, emptyText = "None.") {
  return items.length === 0
    ? emptyText
    : items.map((item) => `- ${item}`).join("\n");
}

function routeAvailability(route) {
  if (route.materialization === "active") {
    return "The filesystem route is active. Its business behavior remains owned by the referenced module contracts.";
  }

  if (route.materialization === "scaffolded") {
    return "The filesystem route is reserved and currently returns the canonical unavailable response.";
  }

  return "This is a documented-only URL contract. No `page.tsx` or `route.ts` is materialized.";
}

export function renderRouteReadme(route, sourcesById) {
  const delivery = route.kind === "page"
    ? `- Page function: \`${route.pageFunction}\``
    : route.methods
        .map(
          (method) =>
            `- \`${method.method}\`: \`${method.function}\`${method.summary ? ` — ${method.summary}` : ""}`,
        )
        .join("\n");
  const modules = route.modules.map((module) => {
    const useCases = module.useCases.length === 0
      ? "no route-level use-case reference"
      : module.useCases.map((useCase) => `\`${useCase}\``).join(", ");
    const functions = module.functions.length === 0
      ? "no runtime function reference"
      : module.functions.map((name) => `\`${name}\``).join(", ");
    return `- **${module.role}:** \`${module.context}\` — use cases: ${useCases}; functions: ${functions}`;
  });
  const pathParameters = route.pathParams.map((parameter) =>
    `- \`${parameter.name}\`: \`${parameter.kind}\``
  );
  const queryParameters = route.queryParams.map((parameter) => {
    const constraints = [
      parameter.required ? "required" : "optional",
      parameter.repeatable ? "repeatable" : "single",
      ...(parameter.default === undefined ? [] : [`default \`${parameter.default}\``]),
    ];
    return `- \`${parameter.name}\`: ${constraints.join(", ")}`;
  });
  const sourceLines = route.sourceIds.map((sourceId) => {
    const source = sourcesById.get(sourceId);

    if (source.kind === "github-docs") {
      return `- [${sourceId}](${source.url}) — ${source.supports.join("; ")}`;
    }

    return `- \`${sourceId}\`: repository source \`${source.path}\` — ${source.supports.join("; ")}`;
  });

  return `<!-- Generated by \`pnpm architecture:docs\` from \`apps/web/route-map.json\`. Do not edit directly. -->

# ${route.title}

## URL contract

- **Route ID:** \`${route.id}\`
- **Support path:** \`${route.supportPath}\`
- **GitHub canonical patterns:** ${route.githubUrls.length === 0 ? "No official pattern is asserted." : route.githubUrls.map((value) => `\`${value}\``).join(", ")}
- **Delivery:** \`${route.kind}\`
- **Status:** \`${route.status}\`
- **Materialization:** \`${route.materialization}\`

## Functional intent

${route.summary}

${routeAvailability(route)}

## Delivery functions

${delivery}

## Module contracts

${markdownList(modules)}

The module README remains the semantic authority for each complete thirteen-field use-case contract.

## Parameters

### Path

${markdownList(pathParameters)}

### Query

${markdownList(queryParameters)}

Query keys not declared here are rejected by the typed URL builder.

## Sources

${markdownList(sourceLines)}
`;
}

function validateUnique(value, seen, message, errors) {
  if (seen.has(value)) {
    errors.push(message);
    return false;
  }

  seen.add(value);
  return true;
}

function expectedUseCaseNames(designsByContext, context) {
  const designs = designsByContext.get(context);

  if (designs instanceof Map) {
    return new Set(designs.keys());
  }

  return new Set((designs ?? []).map((design) => design.name));
}

function resolveRepositoryPath(repositoryRoot, relativePath) {
  return resolve(repositoryRoot, ...relativePath.split("/"));
}

export function validateRouteCatalog({
  repositoryRoot,
  contextsByPath,
  designsByContext,
  errors,
  generatedErrors,
}) {
  const catalogPath = routeMapPath(repositoryRoot);

  if (!existsSync(catalogPath)) {
    errors.push("[ARCH-ROUTE-001] Missing apps/web/route-map.json.");
    return;
  }

  let catalog;

  try {
    catalog = readRouteCatalog(repositoryRoot);
  } catch {
    errors.push("[ARCH-ROUTE-001] apps/web/route-map.json is not valid JSON.");
    return;
  }

  if (
    catalog?.version !== 1 ||
    !Array.isArray(catalog.sources) ||
    !Array.isArray(catalog.routes)
  ) {
    errors.push("[ARCH-ROUTE-001] route-map.json has an invalid v1 shape.");
    return;
  }

  const sourceIds = new Set();
  const sourcesById = new Map();

  for (const source of catalog.sources) {
    const validBase =
      typeof source?.id === "string" &&
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(source.id) &&
      Array.isArray(source.supports) &&
      source.supports.length > 0 &&
      source.supports.every((item) => typeof item === "string" && item !== "") &&
      validateUnique(
        source.id,
        sourceIds,
        `[ARCH-ROUTE-007] Duplicate route source ID ${source.id}.`,
        errors,
      );
    const validGitHubDocs =
      source.kind === "github-docs" &&
      typeof source.url === "string" &&
      source.url.startsWith("https://docs.github.com/en/") &&
      /^\d{4}-\d{2}-\d{2}$/.test(source.verifiedOn);
    const validRepository =
      source.kind === "repository" &&
      typeof source.path === "string" &&
      source.path !== "" &&
      existsSync(resolveRepositoryPath(repositoryRoot, source.path));

    if (!validBase || (!validGitHubDocs && !validRepository)) {
      errors.push(
        `[ARCH-ROUTE-007] Route source ${source?.id ?? "<unknown>"} must be an official GitHub Docs URL or an existing repository path.`,
      );
    }

    if (typeof source?.id === "string") {
      sourcesById.set(source.id, source);
    }
  }

  const actualFiles = discoverAppRoutes(repositoryRoot);
  const actualFileSet = new Set(actualFiles);
  const catalogFiles = new Set();
  const routeIds = new Set();
  const paths = new Set();
  const readmes = new Set();

  for (const route of catalog.routes) {
    const validBase =
      typeof route?.id === "string" &&
      /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(route.id) &&
      (route.kind === "page" || route.kind === "handler") &&
      typeof route.supportPath === "string" &&
      route.supportPath.startsWith("/") &&
      routeStatuses.has(route.status) &&
      materializations.has(route.materialization) &&
      typeof route.title === "string" &&
      route.title !== "" &&
      typeof route.summary === "string" &&
      route.summary !== "" &&
      typeof route.readme === "string" &&
      route.readme.startsWith("apps/web/src/app/") &&
      route.readme.endsWith("/README.md") &&
      Array.isArray(route.githubUrls) &&
      route.githubUrls.every((url) =>
        typeof url === "string" && url.startsWith("https://github.com/")
      ) &&
      Array.isArray(route.pathParams) &&
      Array.isArray(route.queryParams) &&
      Array.isArray(route.modules) &&
      route.modules.length > 0 &&
      Array.isArray(route.sourceIds) &&
      route.sourceIds.length > 0;

    if (!validBase) {
      errors.push(
        `[ARCH-ROUTE-001] Route ${route?.id ?? "<unknown>"} has an invalid v1 shape.`,
      );
      continue;
    }

    validateUnique(
      route.id,
      routeIds,
      `[ARCH-ROUTE-002] Duplicate route ID ${route.id}.`,
      errors,
    );
    validateUnique(
      route.supportPath,
      paths,
      `[ARCH-ROUTE-002] Duplicate Support path ${route.supportPath}.`,
      errors,
    );
    validateUnique(
      route.readme,
      readmes,
      `[ARCH-ROUTE-002] Duplicate route README ${route.readme}.`,
      errors,
    );

    const expectedParams = parameterSchemaFromPattern(route.supportPath);

    if (JSON.stringify(expectedParams) !== JSON.stringify(route.pathParams)) {
      errors.push(
        `[ARCH-ROUTE-003] ${route.id} path parameter schema does not match ${route.supportPath}.`,
      );
    }

    const queryNames = new Set();
    for (const query of route.queryParams) {
      if (
        typeof query?.name !== "string" ||
        !/^[A-Za-z][A-Za-z0-9]*$/.test(query.name) ||
        typeof query.required !== "boolean" ||
        typeof query.repeatable !== "boolean" ||
        (query.default !== undefined && typeof query.default !== "string") ||
        !validateUnique(
          query.name,
          queryNames,
          `[ARCH-ROUTE-003] ${route.id} declares query ${query.name} more than once.`,
          errors,
        )
      ) {
        errors.push(`[ARCH-ROUTE-003] ${route.id} has an invalid query schema.`);
      }

      if (query.required && query.default !== undefined) {
        errors.push(
          `[ARCH-ROUTE-003] ${route.id} query ${query.name} cannot be required and defaulted.`,
        );
      }
    }

    const ownerCount = route.modules.filter((module) => module.role === "owner").length;

    if (ownerCount !== 1) {
      errors.push(`[ARCH-ROUTE-005] ${route.id} must declare exactly one owner.`);
    }

    const declaredContextIds = new Set();
    for (const module of route.modules) {
      const validModule =
        typeof module?.context === "string" &&
        (module.role === "owner" || module.role === "collaborator") &&
        Array.isArray(module.useCases) &&
        module.useCases.every((useCase) =>
          typeof useCase === "string" && useCase !== ""
        ) &&
        Array.isArray(module.functions) &&
        module.functions.every((name) =>
          typeof name === "string" && /^[a-z][A-Za-z0-9]*$/.test(name)
        ) &&
        validateUnique(
          module.context,
          declaredContextIds,
          `[ARCH-ROUTE-005] ${route.id} declares ${module.context} more than once.`,
          errors,
        );

      if (!validModule || !contextsByPath.has(module.context)) {
        errors.push(
          `[ARCH-ROUTE-005] ${route.id} references unknown or invalid module ${module?.context ?? "<unknown>"}.`,
        );
        continue;
      }

      const useCaseNames = expectedUseCaseNames(designsByContext, module.context);

      for (const useCase of module.useCases) {
        if (!useCaseNames.has(useCase)) {
          errors.push(
            `[ARCH-ROUTE-006] ${route.id} references missing designed use case ${module.context}#${useCase}.`,
          );
        }
      }
    }

    for (const sourceId of route.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `[ARCH-ROUTE-007] ${route.id} references unknown source ${sourceId}.`,
        );
      }
    }

    if (route.materialization === "documented-only") {
      if (route.file !== undefined && route.file !== null) {
        errors.push(
          `[ARCH-ROUTE-004] Documented-only route ${route.id} must not declare a delivery file.`,
        );
      }

      const readmeDirectory = dirname(
        resolveRepositoryPath(repositoryRoot, route.readme),
      );
      if (
        existsSync(join(readmeDirectory, "page.tsx")) ||
        existsSync(join(readmeDirectory, "route.ts"))
      ) {
        errors.push(
          `[ARCH-ROUTE-004] Documented-only route ${route.id} unexpectedly has a delivery file.`,
        );
      }
    } else {
      if (
        typeof route.file !== "string" ||
        !actualFileSet.has(route.file) ||
        !validateUnique(
          route.file,
          catalogFiles,
          `[ARCH-ROUTE-002] Delivery file ${route.file} is mapped more than once.`,
          errors,
        )
      ) {
        errors.push(
          `[ARCH-ROUTE-001] ${route.id} must reference one actual App Router delivery file.`,
        );
        continue;
      }

      const expectedReadmePath = `${normalizePath(dirname(route.file))}/README.md`;
      if (route.readme !== expectedReadmePath) {
        errors.push(
          `[ARCH-ROUTE-003] ${route.id} README must be beside its delivery file at ${expectedReadmePath}.`,
        );
      }

      const derivedPath = deriveSupportPath(route.file);
      if (derivedPath !== route.supportPath) {
        errors.push(
          `[ARCH-ROUTE-003] ${route.id} declares ${route.supportPath}, but ${route.file} derives ${derivedPath}.`,
        );
      }

      const absoluteFile = resolveRepositoryPath(repositoryRoot, route.file);
      const sourceFile = parseSourceFile(absoluteFile);
      const delivery = exportedDelivery(sourceFile);

      if (
        route.kind === "page" &&
        (typeof route.pageFunction !== "string" ||
          delivery.pageFunction !== route.pageFunction)
      ) {
        errors.push(
          `[ARCH-ROUTE-004] ${route.id} page function does not match ${route.file}.`,
        );
      }

      if (route.kind === "handler") {
        const declaredMethods = Array.isArray(route.methods)
          ? route.methods.map((method) => method.method).sort()
          : [];

        if (
          declaredMethods.length === 0 ||
          JSON.stringify(declaredMethods) !== JSON.stringify(delivery.methods) ||
          route.methods.some((method) =>
            method.function !== method.method ||
            !httpMethods.has(method.method)
          )
        ) {
          errors.push(
            `[ARCH-ROUTE-004] ${route.id} handler methods do not match ${route.file}.`,
          );
        }
      }

      const moduleImports = importedModules(sourceFile);
      const importedFunctionsByContext = new Map();
      for (const imported of moduleImports) {
        if (!declaredContextIds.has(imported.context)) {
          errors.push(
            `[ARCH-ROUTE-005] ${route.id} imports undeclared module ${imported.context}.`,
          );
        }

        if (
          imported.entrypoint !== undefined &&
          !publicModuleEntrypoints.has(imported.entrypoint)
        ) {
          errors.push(
            `[ARCH-ROUTE-005] ${route.id} deep-imports ${imported.context}/${imported.entrypoint}; App Router delivery must use a module public entrypoint.`,
          );
        }

        const functions = importedFunctionsByContext.get(imported.context) ??
          new Set();
        for (const name of imported.functions) {
          functions.add(name);
        }
        importedFunctionsByContext.set(imported.context, functions);
      }

      for (const module of route.modules) {
        const importedFunctions = [
          ...(importedFunctionsByContext.get(module.context) ?? []),
        ].sort();
        const declaredFunctions = [...module.functions].sort();

        if (
          JSON.stringify(importedFunctions) !==
            JSON.stringify(declaredFunctions)
        ) {
          errors.push(
            `[ARCH-ROUTE-005] ${route.id} function references for ${module.context} do not match its public-entrypoint imports.`,
          );
        }
      }
    }

    if (route.sourceIds.every((sourceId) => sourcesById.has(sourceId))) {
      const expectedReadme = renderRouteReadme(route, sourcesById);
      const readmePath = resolveRepositoryPath(repositoryRoot, route.readme);

      if (
        !existsSync(readmePath) ||
        normalizedText(readFileSync(readmePath, "utf8")) !== expectedReadme
      ) {
        generatedErrors.push(
          `[ARCH-ROUTE-008] ${route.readme} is missing or stale; run pnpm architecture:docs.`,
        );
      }
    }
  }

  const missingFiles = actualFiles.filter((file) => !catalogFiles.has(file));
  const extraFiles = [...catalogFiles].filter((file) => !actualFileSet.has(file));

  if (missingFiles.length > 0 || extraFiles.length > 0) {
    errors.push(
      `[ARCH-ROUTE-001] Route catalog coverage differs from App Router delivery files. Missing: ${missingFiles.join(", ") || "none"}. Extra: ${extraFiles.join(", ") || "none"}.`,
    );
  }

  const actualReadmes = listFiles(
    join(repositoryRoot, "apps", "web", "src", "app"),
  )
    .filter((filePath) => filePath.endsWith(`${sep}README.md`))
    .map((filePath) => projectRelative(repositoryRoot, filePath))
    .sort();
  const unexpectedReadmes = actualReadmes.filter(
    (readmePath) => !readmes.has(readmePath),
  );

  if (unexpectedReadmes.length > 0) {
    generatedErrors.push(
      `[ARCH-ROUTE-008] App Router contains README files not generated from route-map.json: ${unexpectedReadmes.join(", ")}.`,
    );
  }

  const expectedContracts = renderRouteContracts(catalog);
  const contractsPath = generatedContractsPath(repositoryRoot);

  if (
    !existsSync(contractsPath) ||
    normalizedText(readFileSync(contractsPath, "utf8")) !== expectedContracts
  ) {
    generatedErrors.push(
      "[ARCH-ROUTE-008] route-contracts.generated.ts is missing or stale; run pnpm architecture:docs.",
    );
  }
}

export function generateRouteArtifacts(repositoryRoot) {
  const catalog = readRouteCatalog(repositoryRoot);
  const sourcesById = new Map(
    catalog.sources.map((source) => [source.id, source]),
  );
  const written = [];

  for (const route of catalog.routes) {
    const readmePath = resolveRepositoryPath(repositoryRoot, route.readme);
    mkdirSync(dirname(readmePath), { recursive: true });
    writeFileSync(readmePath, renderRouteReadme(route, sourcesById), "utf8");
    written.push(route.readme);
  }

  const contractsPath = generatedContractsPath(repositoryRoot);
  mkdirSync(dirname(contractsPath), { recursive: true });
  writeFileSync(contractsPath, renderRouteContracts(catalog), "utf8");
  written.push(projectRelative(repositoryRoot, contractsPath));

  return written.sort();
}
