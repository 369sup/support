function staticName(node) {
  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return String(node.value);
  }

  return undefined;
}

function matchesAllowedAlias(source, imported, local, allowedAliases) {
  return allowedAliases.some((allowedAlias) => {
    return (
      new RegExp(allowedAlias.source).test(source) &&
      new RegExp(allowedAlias.imported).test(imported) &&
      new RegExp(allowedAlias.local).test(local)
    );
  });
}

function memberPath(node) {
  if (node.type === "Identifier") {
    return [node.name];
  }

  if (node.type !== "MemberExpression" || node.optional) {
    return undefined;
  }

  if (node.computed && node.property.type !== "Literal") {
    return undefined;
  }

  const objectPath = memberPath(node.object);
  const propertyName = staticName(node.property);

  if (objectPath === undefined || propertyName === undefined) {
    return undefined;
  }

  return [...objectPath, propertyName];
}

const noRenamedImportExport = {
  meta: {
    type: "problem",
    docs: {
      description: "Keep imported and exported names stable across modules.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          allowedImportAliases: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["source", "imported", "local"],
              properties: {
                source: { type: "string" },
                imported: { type: "string" },
                local: { type: "string" },
              },
            },
          },
        },
      },
    ],
    messages: {
      renamedImport:
        "Import '{{imported}}' with its original name. Add a narrow centralized exception only for a real collision.",
      renamedExport:
        "Export '{{local}}' with its original name instead of publishing it as '{{exported}}'.",
    },
  },
  create(context) {
    const [{ allowedImportAliases = [] } = {}] = context.options;

    return {
      ImportSpecifier(node) {
        const imported = staticName(node.imported);
        const local = staticName(node.local);
        const source = String(node.parent.source.value);

        if (
          imported !== undefined &&
          local !== undefined &&
          imported !== local &&
          !matchesAllowedAlias(source, imported, local, allowedImportAliases)
        ) {
          context.report({
            node,
            messageId: "renamedImport",
            data: { imported },
          });
        }
      },
      ExportSpecifier(node) {
        const local = staticName(node.local);
        const exported = staticName(node.exported);

        if (
          local !== undefined &&
          exported !== undefined &&
          local !== exported
        ) {
          context.report({
            node,
            messageId: "renamedExport",
            data: { local, exported },
          });
        }
      },
    };
  },
};

const noDefaultExport = {
  meta: {
    type: "problem",
    docs: {
      description: "Require stable named exports outside framework entrypoints.",
    },
    schema: [],
    messages: {
      defaultExport:
        "Use a named export so importers cannot silently rename this API.",
    },
  },
  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        context.report({ node, messageId: "defaultExport" });
      },
    };
  },
};

const noExportAll = {
  meta: {
    type: "problem",
    docs: {
      description: "Require public entrypoints to list every re-export.",
    },
    schema: [],
    messages: {
      exportAll:
        "List public exports explicitly; export-all hides the API source and collisions.",
    },
  },
  create(context) {
    return {
      ExportAllDeclaration(node) {
        context.report({ node, messageId: "exportAll" });
      },
    };
  },
};

const noNamespaceImport = {
  meta: {
    type: "problem",
    docs: {
      description: "Require imports to name the dependencies they use.",
    },
    schema: [],
    messages: {
      namespaceImport:
        "Import the required names explicitly instead of hiding them behind a namespace.",
    },
  },
  create(context) {
    return {
      ImportNamespaceSpecifier(node) {
        context.report({ node, messageId: "namespaceImport" });
      },
    };
  },
};

const noVariableDynamicImport = {
  meta: {
    type: "problem",
    docs: {
      description: "Keep dynamically loaded module paths statically visible.",
    },
    schema: [],
    messages: {
      variableImport:
        "Use a fixed string import path or an explicit typed lookup of fixed imports.",
    },
  },
  create(context) {
    return {
      ImportExpression(node) {
        const isStringLiteral =
          node.source.type === "Literal" &&
          typeof node.source.value === "string";
        const isStaticTemplate =
          node.source.type === "TemplateLiteral" &&
          node.source.expressions.length === 0;

        if (!isStringLiteral && !isStaticTemplate) {
          context.report({ node, messageId: "variableImport" });
        }
      },
    };
  },
};

const noSideEffectImport = {
  meta: {
    type: "problem",
    docs: {
      description: "Keep initialization dependencies explicit.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedModules: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      sideEffectImport:
        "Replace this hidden side-effect import with an explicit initialization function.",
    },
  },
  create(context) {
    const [{ allowedModules = [] } = {}] = context.options;

    return {
      ImportDeclaration(node) {
        if (
          node.specifiers.length === 0 &&
          !allowedModules.includes(node.source.value)
        ) {
          context.report({ node, messageId: "sideEffectImport" });
        }
      },
    };
  },
};

const noClientRouteShell = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Keep App Router pages and layouts as Server Component composition shells.",
    },
    schema: [],
    messages: {
      clientRouteShell:
        "Move browser interaction into the smallest child Client Component; pages and layouts remain Server Components.",
    },
  },
  create(context) {
    return {
      Program(node) {
        const clientDirective = node.body.find((statement) => {
          return (
            statement.type === "ExpressionStatement" &&
            statement.directive === "use client"
          );
        });

        if (clientDirective !== undefined) {
          context.report({
            node: clientDirective,
            messageId: "clientRouteShell",
          });
        }
      },
    };
  },
};

const noFocusedOrDisabledTests = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent focused, disabled, or silently deferred tests from entering the repository.",
    },
    schema: [],
    messages: {
      disabledTest:
        "Do not commit focused, skipped, or fixme tests; fix the test or track an explicit external blocker.",
    },
  },
  create(context) {
    const testRoots = new Set(["describe", "it", "test"]);
    const prohibitedModifiers = new Set(["fixme", "only", "skip", "todo"]);

    return {
      CallExpression(node) {
        const path = memberPath(node.callee);

        if (
          path !== undefined &&
          testRoots.has(path[0]) &&
          prohibitedModifiers.has(path.at(-1))
        ) {
          context.report({ node, messageId: "disabledTest" });
        }
      },
    };
  },
};

const noFixedTestWait = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require browser tests to wait for observable conditions instead of elapsed time.",
    },
    schema: [],
    messages: {
      fixedWait:
        "Wait for an observable UI, network, or application condition instead of waitForTimeout().",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const path = memberPath(node.callee);

        if (path?.at(-1) === "waitForTimeout") {
          context.report({ node, messageId: "fixedWait" });
        }
      },
    };
  },
};

const noUncontrolledTestSources = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require unit and integration tests to control time, randomness, timers, and network access.",
    },
    schema: [],
    messages: {
      uncontrolledSource:
        "Inject, fake, or explicitly control {{source}} instead of reading it directly in a test.",
    },
  },
  create(context) {
    const prohibitedCalls = new Map([
      ["Date.now", "the real clock"],
      ["Math.random", "randomness"],
      ["crypto.getRandomValues", "randomness"],
      ["crypto.randomUUID", "randomness"],
      ["fetch", "the network"],
      ["performance.now", "the real clock"],
      ["setInterval", "a real timer"],
      ["setTimeout", "a real timer"],
    ]);

    return {
      CallExpression(node) {
        const path = memberPath(node.callee);
        const source =
          path === undefined ? undefined : prohibitedCalls.get(path.join("."));

        if (source !== undefined) {
          context.report({
            node,
            messageId: "uncontrolledSource",
            data: { source },
          });
        }
      },
      NewExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "Date" &&
          node.arguments.length === 0
        ) {
          context.report({
            node,
            messageId: "uncontrolledSource",
            data: { source: "the real clock" },
          });
        }
      },
    };
  },
};

export const typescriptClarityPlugin = {
  rules: {
    "no-client-route-shell": noClientRouteShell,
    "no-default-export": noDefaultExport,
    "no-export-all": noExportAll,
    "no-fixed-test-wait": noFixedTestWait,
    "no-focused-or-disabled-tests": noFocusedOrDisabledTests,
    "no-namespace-import": noNamespaceImport,
    "no-renamed-import-export": noRenamedImportExport,
    "no-side-effect-import": noSideEffectImport,
    "no-uncontrolled-test-sources": noUncontrolledTestSources,
    "no-variable-dynamic-import": noVariableDynamicImport,
  },
};
