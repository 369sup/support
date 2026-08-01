import {
  existsSync,
  readFileSync,
  statSync,
} from "node:fs";
import {
  dirname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import ts from "typescript";

const sourceExtensions = [".ts", ".tsx", ".mts", ".cts"];

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(rootDir, filePath) {
  return normalizePath(relative(rootDir, filePath));
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

export function buildSourceGraph(rootDir, sourceFiles) {
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

function moduleContextForFile(rootDir, filePath) {
  const relativePath = projectRelative(rootDir, filePath);
  const segments = relativePath.split("/");

  if (
    segments[0] !== "src" ||
    segments[1] !== "modules" ||
    segments[2] === undefined ||
    segments[3] === undefined
  ) {
    return undefined;
  }

  return `${segments[2]}/${segments[3]}`;
}

export function validateDeclaredContextDependencies(
  rootDir,
  graph,
  contextsByPath,
  errors,
) {
  const reported = new Set();

  for (const [importer, dependencies] of graph) {
    const importerContext = moduleContextForFile(rootDir, importer);

    if (importerContext === undefined) {
      continue;
    }

    const declaredDependencies =
      contextsByPath.get(importerContext)?.dependencies ?? [];
    const plannedRelationships =
      contextsByPath.get(importerContext)?.plannedRelationships ?? [];

    for (const dependency of dependencies) {
      const importedContext = moduleContextForFile(rootDir, dependency);

      if (
        importedContext === undefined ||
        importedContext === importerContext
      ) {
        continue;
      }

      const isDeclared = declaredDependencies.some((entry) => {
        return (
          entry.context === importedContext &&
          entry.mode === "synchronous"
        );
      });
      const reportKey = `${importerContext}->${importedContext}`;

      if (!isDeclared && !reported.has(reportKey)) {
        const isOnlyPlanned = plannedRelationships.some((entry) => {
          return entry.context === importedContext &&
            entry.mode === "synchronous";
        });
        errors.push(isOnlyPlanned
          ? `[ARCH-DEP-013] ${importerContext} imports ${importedContext} through a planned relationship that does not authorize source imports.`
          : `[ARCH-DEP-010] ${importerContext} imports ${importedContext} without a synchronous module-map dependency.`);
        reported.add(reportKey);
      }
    }
  }
}

export function validateSourceCycles(rootDir, graph, errors) {
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

export function validateServerOnlyMarkers(rootDir, metadata, errors) {
  for (const [filePath, fileMetadata] of metadata) {
    const importsServerOnly =
      fileMetadata.externalSpecifiers.includes("server-only");
    const usesServerCapability =
      fileMetadata.hasProcessEnvironment ||
      fileMetadata.externalSpecifiers.some((specifier) => {
        return specifier.startsWith("node:");
      });

    if (usesServerCapability && !importsServerOnly) {
      errors.push(
        `[ARCH-SERVER-001] ${projectRelative(rootDir, filePath)} uses a server capability without importing server-only.`,
      );
    }
  }
}

export function validateClientGraphs(rootDir, graph, metadata, errors) {
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
      const importsServerPackage = fileMetadata.externalSpecifiers.some(
        (specifier) => {
          return specifier === "server-only" || specifier.startsWith("node:");
        },
      );

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
