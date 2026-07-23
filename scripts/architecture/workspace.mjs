import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import {
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

import ts from "typescript";

import {
  allowedWorkspaceDependencyKinds,
  workspacePackagePolicy,
} from "@support/tooling/architecture/policy";

const dependencySections = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];
const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".pnpm-store",
  ".turbo",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results",
]);

function normalizePath(value) {
  return value.split(sep).join("/");
}

function projectRelative(repositoryRoot, filePath) {
  return normalizePath(relative(repositoryRoot, filePath));
}

function readManifest(manifestPath, errors) {
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(
      `[ARCH-PKG-001] Invalid workspace manifest ${normalizePath(manifestPath)}: ${message}`,
    );
    return undefined;
  }
}

function workspaceManifestPaths(repositoryRoot) {
  const manifestPaths = [join(repositoryRoot, "package.json")];

  for (const workspaceRootName of ["apps", "packages"]) {
    const workspaceRoot = join(repositoryRoot, workspaceRootName);

    if (!existsSync(workspaceRoot)) {
      continue;
    }

    for (const entry of readdirSync(workspaceRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const manifestPath = join(workspaceRoot, entry.name, "package.json");
      if (existsSync(manifestPath)) {
        manifestPaths.push(manifestPath);
      }
    }
  }

  return manifestPaths;
}

function listSourceFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listSourceFiles(entryPath));
    } else if (
      entry.isFile() &&
      sourceExtensions.has(extname(entry.name).toLowerCase()) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function internalDependencyEntries(manifest) {
  const entries = [];

  for (const section of dependencySections) {
    const dependencies = manifest[section];
    if (dependencies === undefined || dependencies === null) {
      continue;
    }

    for (const [name, version] of Object.entries(dependencies)) {
      if (name.startsWith("@support/")) {
        entries.push({ name, section, version });
      }
    }
  }

  return entries;
}

function exportTargets(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(exportTargets);
  }

  if (value !== null && typeof value === "object") {
    return Object.values(value).flatMap(exportTargets);
  }

  return [];
}

function packageExportKeys(manifest) {
  if (typeof manifest.exports === "string") {
    return new Set(["."]);
  }

  if (manifest.exports === null || typeof manifest.exports !== "object") {
    return new Set();
  }

  return new Set(Object.keys(manifest.exports));
}

function validateExportTargets(workspace, repositoryRoot, errors) {
  if (workspace.manifest.exports === undefined) {
    return;
  }

  for (const target of exportTargets(workspace.manifest.exports)) {
    if (!target.startsWith("./")) {
      errors.push(
        `[ARCH-PKG-008] ${workspace.name} export target ${target} must be package-relative.`,
      );
      continue;
    }

    const targetPath = resolve(workspace.root, target);
    if (
      !targetPath.startsWith(`${workspace.root}${sep}`) ||
      !existsSync(targetPath)
    ) {
      errors.push(
        `[ARCH-PKG-008] ${workspace.name} export target ${target} does not exist within ${projectRelative(repositoryRoot, workspace.root)}.`,
      );
    }
  }
}

function sourceKind(filePath) {
  const extension = extname(filePath).toLowerCase();
  if (extension === ".tsx" || extension === ".jsx") {
    return ts.ScriptKind.TSX;
  }
  if (extension === ".js" || extension === ".mjs" || extension === ".cjs") {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function moduleSpecifiers(filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filePath),
  );
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "require" &&
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

function targetForSpecifier(specifier, workspacesByName) {
  return [...workspacesByName.values()]
    .filter((workspace) => {
      return specifier === workspace.name ||
        specifier.startsWith(`${workspace.name}/`);
    })
    .sort((left, right) => right.name.length - left.name.length)[0];
}

function declaredInternalDependencies(manifest) {
  return new Set(internalDependencyEntries(manifest).map((entry) => entry.name));
}

function isWithin(candidatePath, rootPath) {
  return candidatePath === rootPath ||
    candidatePath.startsWith(`${rootPath}${sep}`);
}

function validateSourceImports(
  workspace,
  workspaces,
  workspacesByName,
  repositoryRoot,
  errors,
) {
  const declaredDependencies = declaredInternalDependencies(workspace.manifest);
  const sourceFiles = workspace.kind === "root"
    ? listSourceFiles(join(repositoryRoot, "scripts"))
    : listSourceFiles(workspace.root);

  for (const filePath of sourceFiles) {
    for (const specifier of moduleSpecifiers(filePath)) {
      const targetWorkspace = targetForSpecifier(specifier, workspacesByName);

      if (targetWorkspace !== undefined) {
        if (
          targetWorkspace.name === workspace.name ||
          !declaredDependencies.has(targetWorkspace.name)
        ) {
          errors.push(
            `[ARCH-PKG-005] ${projectRelative(repositoryRoot, filePath)} imports ${specifier} without declaring ${targetWorkspace.name}.`,
          );
        }

        const subpath = specifier.slice(targetWorkspace.name.length);
        const exportKey = subpath === "" ? "." : `.${subpath}`;
        if (!packageExportKeys(targetWorkspace.manifest).has(exportKey)) {
          errors.push(
            `[ARCH-PKG-006] ${projectRelative(repositoryRoot, filePath)} imports unexported package subpath ${specifier}.`,
          );
        }

        continue;
      }

      if (specifier.includes("packages/") || specifier.includes("apps/")) {
        errors.push(
          `[ARCH-PKG-007] ${projectRelative(repositoryRoot, filePath)} imports a workspace source path directly: ${specifier}.`,
        );
        continue;
      }

      if (!specifier.startsWith(".")) {
        continue;
      }

      const resolvedImport = resolve(dirname(filePath), specifier);
      const foreignWorkspace = workspaces.find((candidate) => {
        return candidate.kind !== "root" &&
          candidate.name !== workspace.name &&
          isWithin(resolvedImport, candidate.root);
      });

      if (foreignWorkspace !== undefined) {
        errors.push(
          `[ARCH-PKG-007] ${projectRelative(repositoryRoot, filePath)} crosses into ${foreignWorkspace.name} through a relative import.`,
        );
      }
    }
  }
}

function validatePackageCycles(workspaces, errors) {
  const graph = new Map(
    workspaces.map((workspace) => [
      workspace.name,
      internalDependencyEntries(workspace.manifest).map((entry) => entry.name),
    ]),
  );
  const visiting = new Set();
  const visited = new Set();

  function visit(name, path) {
    if (visiting.has(name)) {
      const cycleStart = path.indexOf(name);
      const cycle = [...path.slice(cycleStart), name];
      errors.push(
        `[ARCH-PKG-008] Workspace package dependency cycle: ${cycle.join(" -> ")}.`,
      );
      return;
    }

    if (visited.has(name)) {
      return;
    }

    visiting.add(name);
    for (const dependency of graph.get(name) ?? []) {
      if (graph.has(dependency)) {
        visit(dependency, [...path, name]);
      }
    }
    visiting.delete(name);
    visited.add(name);
  }

  for (const workspace of workspaces) {
    visit(workspace.name, []);
  }
}

export function validateWorkspacePackages(repositoryRoot, errors) {
  const workspaces = [];
  const names = new Set();

  for (const manifestPath of workspaceManifestPaths(repositoryRoot)) {
    const manifest = readManifest(manifestPath, errors);
    if (manifest === undefined) {
      continue;
    }

    const packageRoot = dirname(manifestPath);
    const packagePath = packageRoot === repositoryRoot
      ? "."
      : projectRelative(repositoryRoot, packageRoot);
    const policy = workspacePackagePolicy[manifest.name];

    if (
      typeof manifest.name !== "string" ||
      names.has(manifest.name) ||
      manifest.private !== true ||
      policy === undefined ||
      policy.path !== packagePath
    ) {
      errors.push(
        `[ARCH-PKG-001] ${packagePath}/package.json must have a unique policy-owned name, private true, and the canonical workspace path.`,
      );
      continue;
    }

    names.add(manifest.name);
    workspaces.push({
      kind: policy.kind,
      manifest,
      name: manifest.name,
      root: packageRoot,
    });
  }

  for (const [name, policy] of Object.entries(workspacePackagePolicy)) {
    if (!names.has(name)) {
      errors.push(
        `[ARCH-PKG-001] Missing policy-owned workspace package ${name} at ${policy.path}.`,
      );
    }
  }

  const workspacesByName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace]),
  );

  for (const workspace of workspaces) {
    validateExportTargets(workspace, repositoryRoot, errors);
    const dependencyNames = new Set();

    for (const dependency of internalDependencyEntries(workspace.manifest)) {
      if (dependencyNames.has(dependency.name)) {
        errors.push(
          `[ARCH-PKG-002] ${workspace.name} declares ${dependency.name} in more than one dependency section.`,
        );
        continue;
      }
      dependencyNames.add(dependency.name);

      const target = workspacesByName.get(dependency.name);

      if (target === undefined || dependency.version !== "workspace:*") {
        errors.push(
          `[ARCH-PKG-002] ${workspace.name} ${dependency.section} entry ${dependency.name} must target an existing workspace package with workspace:*.`,
        );
        continue;
      }

      if (workspace.kind !== "app" && target.kind === "app") {
        errors.push(
          `[ARCH-PKG-003] ${workspace.name} must not depend on application package ${target.name}.`,
        );
        continue;
      }

      const allowedKinds =
        allowedWorkspaceDependencyKinds[dependency.section]?.[workspace.kind] ??
        [];
      if (!allowedKinds.includes(target.kind)) {
        errors.push(
          `[ARCH-PKG-004] ${workspace.name} (${workspace.kind}) cannot declare ${target.name} (${target.kind}) in ${dependency.section}.`,
        );
      }
    }
  }

  for (const workspace of workspaces) {
    validateSourceImports(
      workspace,
      workspaces,
      workspacesByName,
      repositoryRoot,
      errors,
    );
  }

  validatePackageCycles(workspaces, errors);
}
