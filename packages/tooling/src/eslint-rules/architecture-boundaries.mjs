import { posix as path } from "node:path";

const publicEntrypoints = new Set([
  "server-api",
  "browser-ui",
  "server-actions",
  "integration-contracts",
]);

function normalizeFilename(filename) {
  return filename.replaceAll("\\", "/");
}

function projectPath(filename) {
  const normalized = normalizeFilename(filename);
  const sourceIndex = normalized.lastIndexOf("/src/");

  if (sourceIndex === -1) {
    return undefined;
  }

  return normalized.slice(sourceIndex + 1);
}

function resolveProjectImport(currentPath, source) {
  if (source.startsWith("@/")) {
    return `src/${source.slice(2)}`;
  }

  if (source.startsWith(".")) {
    return normalizeFilename(
      path.normalize(path.join(path.dirname(currentPath), source)),
    );
  }

  return undefined;
}

function moduleLocation(candidatePath) {
  const segments = candidatePath.split("/");

  if (segments[0] !== "src" || segments[1] !== "modules") {
    return undefined;
  }

  const subdomain = segments[2];
  const context = segments[3];

  if (subdomain === undefined || context === undefined) {
    return undefined;
  }

  return {
    subdomain,
    context,
    internalPath: segments.slice(4).join("/"),
  };
}

function entrypointName(internalPath) {
  if (internalPath === "") {
    return "index";
  }

  const withoutExtension = internalPath.replace(/\.(?:[cm]?ts|tsx)$/, "");

  if (!withoutExtension.includes("/") && publicEntrypoints.has(withoutExtension)) {
    return withoutExtension;
  }

  return undefined;
}

function layer(internalPath) {
  return internalPath.split("/")[0];
}

function hasDirective(program, directive) {
  const firstStatement = program.body[0];
  return (
    firstStatement?.type === "ExpressionStatement" &&
    firstStatement.directive === directive
  );
}

function isAsyncExportDeclaration(declaration) {
  if (declaration.type === "FunctionDeclaration") {
    return declaration.async;
  }

  if (declaration.type !== "VariableDeclaration") {
    return false;
  }

  return declaration.declarations.every((variable) => {
    return (
      variable.init?.type === "ArrowFunctionExpression" ||
      variable.init?.type === "FunctionExpression"
    ) && variable.init.async;
  });
}

const enforceImportBoundaries = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce app, bounded-context, and hexagonal import boundaries.",
    },
    schema: [],
    messages: {
      appPrivateModule:
        "[ARCH-DEP-001] Import a bounded context through server-api.ts, browser-ui.ts, server-actions.ts, or integration-contracts.ts.",
      moduleImportsApp:
        "[ARCH-DEP-002] A bounded context must not import the App Router delivery layer.",
      crossContextPrivate:
        "[ARCH-DEP-003] Import another bounded context through a public root entrypoint.",
      domainDirection:
        "[ARCH-DEP-004] Domain code may import only the same bounded context's domain layer.",
      applicationDirection:
        "[ARCH-DEP-005] Application code may import only the same bounded context's application or domain layer.",
      innerExternal:
        "[ARCH-DEP-006] Domain and application code must not depend directly on external packages.",
      clientEntrypoint:
        "[ARCH-DEP-007] Client Components may import a bounded context only through browser-ui.ts or server-actions.ts.",
      contractsDirection:
        "[ARCH-DEP-008] integration-contracts.ts and the contracts layer may import only the same context's contracts layer.",
      sameContextAlias:
        "[ARCH-DEP-009] Use a relative import inside one bounded context so its private ownership remains visible.",
      adapterDirection:
        "[ARCH-DEP-011] Keep inbound and outbound adapters separate and depend only on the permitted inner layers.",
      compositionDirection:
        "[ARCH-DEP-011] Composition may wire only the same context's application, adapters, and contracts.",
    },
  },
  create(context) {
    const currentPath = projectPath(context.filename);

    if (currentPath === undefined) {
      return {};
    }

    const currentModule = moduleLocation(currentPath);
    const isAppFile = currentPath.startsWith("src/app/");
    const isClientComponent = hasDirective(context.sourceCode.ast, "use client");

    function checkImport(node) {
      const source = String(node.source.value);
      const importedPath = resolveProjectImport(currentPath, source);

      if (currentModule !== undefined && importedPath === undefined) {
        const currentLayer = layer(currentModule.internalPath);

        if (currentLayer === "domain" || currentLayer === "application") {
          context.report({ node, messageId: "innerExternal" });
        }

        return;
      }

      if (importedPath === undefined) {
        return;
      }

      const importedModule = moduleLocation(importedPath);

      if (
        currentModule !== undefined &&
        importedPath.startsWith("src/app/")
      ) {
        context.report({ node, messageId: "moduleImportsApp" });
        return;
      }

      if (isAppFile && importedModule !== undefined) {
        const importedEntrypoint = entrypointName(importedModule.internalPath);

        if (importedEntrypoint === undefined) {
          context.report({ node, messageId: "appPrivateModule" });
          return;
        }

        if (
          isClientComponent &&
          importedEntrypoint !== "browser-ui" &&
          importedEntrypoint !== "server-actions"
        ) {
          context.report({ node, messageId: "clientEntrypoint" });
        }

        return;
      }

      if (currentModule === undefined || importedModule === undefined) {
        return;
      }

      const isSameContext =
        currentModule.subdomain === importedModule.subdomain &&
        currentModule.context === importedModule.context;

      if (!isSameContext) {
        if (entrypointName(importedModule.internalPath) === undefined) {
          context.report({ node, messageId: "crossContextPrivate" });
        }

        return;
      }

      if (source.startsWith("@/")) {
        context.report({ node, messageId: "sameContextAlias" });
        return;
      }

      const currentLayer = layer(currentModule.internalPath);
      const importedLayer = layer(importedModule.internalPath);
      const isInboundAdapter =
        currentModule.internalPath.startsWith("adapters/inbound/");
      const isOutboundAdapter =
        currentModule.internalPath.startsWith("adapters/outbound/");
      const importsInboundAdapter =
        importedModule.internalPath.startsWith("adapters/inbound/");
      const importsOutboundAdapter =
        importedModule.internalPath.startsWith("adapters/outbound/");

      if (currentLayer === "domain" && importedLayer !== "domain") {
        context.report({ node, messageId: "domainDirection" });
      }

      if (
        currentLayer === "application" &&
        importedLayer !== "application" &&
        importedLayer !== "domain"
      ) {
        context.report({ node, messageId: "applicationDirection" });
      }

      if (
        (currentModule.internalPath === "integration-contracts.ts" ||
          currentLayer === "contracts") &&
        importedLayer !== "contracts"
      ) {
        context.report({ node, messageId: "contractsDirection" });
      }

      if (
        isInboundAdapter &&
        importedLayer !== "application" &&
        importedLayer !== "contracts" &&
        !importsInboundAdapter
      ) {
        context.report({ node, messageId: "adapterDirection" });
      }

      if (
        isOutboundAdapter &&
        importedLayer !== "application" &&
        importedLayer !== "domain" &&
        importedLayer !== "contracts" &&
        !importsOutboundAdapter
      ) {
        context.report({ node, messageId: "adapterDirection" });
      }

      if (
        currentLayer === "composition" &&
        importedLayer !== "application" &&
        importedLayer !== "adapters" &&
        importedLayer !== "contracts"
      ) {
        context.report({ node, messageId: "compositionDirection" });
      }

    }

    return {
      ImportDeclaration: checkImport,
      ImportExpression: checkImport,
      ExportNamedDeclaration(node) {
        if (node.source !== null) {
          checkImport(node);
        }
      },
    };
  },
};

const noDomainAmbientInfrastructure = {
  meta: {
    type: "problem",
    docs: {
      description: "Keep domain behavior deterministic and infrastructure-free.",
    },
    schema: [],
    messages: {
      ambientInfrastructure:
        "[ARCH-DOM-001] Inject this capability through an explicit value or port instead of using ambient infrastructure.",
    },
  },
  create(context) {
    const currentPath = projectPath(context.filename);
    const currentModule =
      currentPath === undefined ? undefined : moduleLocation(currentPath);

    if (currentModule === undefined || layer(currentModule.internalPath) !== "domain") {
      return {};
    }

    function report(node) {
      context.report({ node, messageId: "ambientInfrastructure" });
    }

    return {
      MemberExpression(node) {
        const objectName =
          node.object.type === "Identifier" ? node.object.name : undefined;
        const propertyName =
          node.property.type === "Identifier" ? node.property.name : undefined;

        if (
          (objectName === "process" && propertyName === "env") ||
          (objectName === "Date" && propertyName === "now") ||
          (objectName === "Math" && propertyName === "random") ||
          (objectName === "crypto" && propertyName === "randomUUID")
        ) {
          report(node);
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Date" &&
          node.arguments.length === 0
        ) {
          report(node);
        }
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "fetch") {
          report(node);
        }
      },
    };
  },
};

function compositionImportNames(program) {
  const names = new Set();

  for (const statement of program.body) {
    if (
      statement.type !== "ImportDeclaration" ||
      !String(statement.source.value).startsWith("./composition/")
    ) {
      continue;
    }

    for (const specifier of statement.specifiers) {
      names.add(specifier.local.name);
    }
  }

  return names;
}

function isCompositionFacadeProjection(declaration, importedNames) {
  if (
    declaration?.type !== "VariableDeclaration" ||
    declaration.kind !== "const" ||
    declaration.declarations.length === 0
  ) {
    return false;
  }

  return declaration.declarations.every((item) => {
    const initializer = item.init;

    return (
      item.id.type === "Identifier" &&
      initializer?.type === "MemberExpression" &&
      !initializer.computed &&
      initializer.object.type === "Identifier" &&
      importedNames.has(initializer.object.name) &&
      initializer.property.type === "Identifier" &&
      initializer.property.name === item.id.name
    );
  });
}

const publicEntrypointContract = {
  meta: {
    type: "problem",
    docs: {
      description: "Make public entrypoint boundaries explicit.",
    },
    schema: [],
    messages: {
      missingClientDirective:
        "[ARCH-API-001] browser-ui.ts must begin with the use client directive.",
      missingServerDirective:
        "[ARCH-API-002] server-actions.ts must begin with the use server directive.",
      nonAsyncAction:
        "[ARCH-API-003] server-actions.ts may directly export only async functions.",
      invalidActionReexport:
        "[ARCH-API-004] server-actions.ts may re-export only explicit .server-action modules or files under server-actions.",
      invalidPublicExport:
        "[ARCH-API-005] Export this capability through the entrypoint's permitted inbound adapter or contracts path.",
    },
  },
  create(context) {
    const currentPath = projectPath(context.filename);

    if (currentPath === undefined) {
      return {};
    }

    const currentModule = moduleLocation(currentPath);

    if (currentModule === undefined) {
      return {};
    }

    const basename = currentModule.internalPath.replace(/\.(?:[cm]?ts|tsx)$/, "");
    const isPublicEntrypoint = publicEntrypoints.has(basename);
    let importedCompositionNames = new Set();

    return {
      Program(node) {
        importedCompositionNames = compositionImportNames(node);

        if (basename === "browser-ui" && !hasDirective(node, "use client")) {
          context.report({ node, messageId: "missingClientDirective" });
        }

        if (basename === "server-actions" && !hasDirective(node, "use server")) {
          context.report({ node, messageId: "missingServerDirective" });
        }
      },
      ExportNamedDeclaration(node) {
        if (!isPublicEntrypoint) {
          return;
        }

        if (basename === "server-actions") {
          if (
            node.declaration !== null &&
            !isAsyncExportDeclaration(node.declaration)
          ) {
            context.report({ node, messageId: "nonAsyncAction" });
          }

          if (node.source !== null) {
            const source = String(node.source.value);
            const isActionModule =
              source.includes("/server-actions/") ||
              /(?:^|\/)server-actions\//.test(source) ||
              source.endsWith(".server-action");

            if (!isActionModule) {
              context.report({ node, messageId: "invalidActionReexport" });
            }
          }

          return;
        }

        if (node.source === null) {
          if (
            basename === "server-api" &&
            isCompositionFacadeProjection(
              node.declaration,
              importedCompositionNames,
            )
          ) {
            return;
          }

          context.report({ node, messageId: "invalidPublicExport" });
          return;
        }

        const source = String(node.source.value);
        const isAllowedSource =
          (basename === "server-api" &&
            (source.startsWith("./adapters/inbound/server/") ||
              source.startsWith("./contracts/"))) ||
          (basename === "browser-ui" &&
            (source.startsWith("./adapters/inbound/react/") ||
              source.startsWith("./contracts/"))) ||
          (basename === "integration-contracts" &&
            source.startsWith("./contracts/"));

        if (!isAllowedSource) {
          context.report({ node, messageId: "invalidPublicExport" });
        }
      },
    };
  },
};

export const architectureBoundariesPlugin = {
  rules: {
    "enforce-import-boundaries": enforceImportBoundaries,
    "no-domain-ambient-infrastructure": noDomainAmbientInfrastructure,
    "public-entrypoint-contract": publicEntrypointContract,
  },
};
