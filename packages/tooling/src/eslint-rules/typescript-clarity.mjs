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
    schema: [],
    messages: {
      sideEffectImport:
        "Replace this hidden side-effect import with an explicit initialization function.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.specifiers.length === 0) {
          context.report({ node, messageId: "sideEffectImport" });
        }
      },
    };
  },
};

export const typescriptClarityPlugin = {
  rules: {
    "no-default-export": noDefaultExport,
    "no-export-all": noExportAll,
    "no-namespace-import": noNamespaceImport,
    "no-renamed-import-export": noRenamedImportExport,
    "no-side-effect-import": noSideEffectImport,
    "no-variable-dynamic-import": noVariableDynamicImport,
  },
};
