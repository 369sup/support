import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

import { architectureBoundariesPlugin } from "@support/tooling/eslint-rules/architecture-boundaries";
import { typescriptClarityPlugin } from "@support/tooling/eslint-rules/typescript-clarity";

export function createTypeScriptLibraryConfig({ tsconfigRootDir }) {
  const typedFiles = ["**/*.{ts,tsx,mts,cts}"];
  const sourceFiles = ["src/**/*.{js,mjs,cjs,ts,tsx,mts,cts}"];

  return defineConfig([
    eslint.configs.recommended,
    {
      linterOptions: {
        reportUnusedDisableDirectives: "error",
        reportUnusedInlineConfigs: "error",
      },
    },
    {
      files: typedFiles,
      extends: [tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: {
        architecture: architectureBoundariesPlugin,
        clarity: typescriptClarityPlugin,
      },
      rules: {
        curly: ["error", "all"],
        "no-cond-assign": ["error", "always"],
        "no-implicit-coercion": [
          "error",
          {
            allow: [],
            boolean: true,
            disallowTemplateShorthand: true,
            number: true,
            string: true,
          },
        ],
        "no-mixed-operators": [
          "error",
          { allowSamePrecedence: false, groups: [["&&", "||", "??"]] },
        ],
        "no-nested-ternary": "error",
        "no-param-reassign": "error",
        "no-sequences": "error",
        "@typescript-eslint/ban-ts-comment": [
          "error",
          { minimumDescriptionLength: 10 },
        ],
        "@typescript-eslint/consistent-type-assertions": [
          "error",
          { assertionStyle: "never" },
        ],
        "@typescript-eslint/consistent-type-exports": "error",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "separate-type-imports", prefer: "type-imports" },
        ],
        "@typescript-eslint/no-confusing-void-expression": "error",
        "@typescript-eslint/no-duplicate-type-constituents": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-redundant-type-constituents": "error",
        "@typescript-eslint/no-unnecessary-condition": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unnecessary-type-parameters": "error",
        "@typescript-eslint/no-unsafe-argument": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-declaration-merging": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-wrapper-object-types": "error",
        "@typescript-eslint/prefer-as-const": "error",
        "@typescript-eslint/prefer-nullish-coalescing": "error",
        "@typescript-eslint/strict-boolean-expressions": [
          "error",
          {
            allowAny: false,
            allowNullableBoolean: false,
            allowNullableEnum: false,
            allowNullableNumber: false,
            allowNullableObject: false,
            allowNullableString: false,
            allowNumber: false,
            allowString: false,
          },
        ],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "@typescript-eslint/unified-signatures": "error",
        "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      },
    },
    {
      files: sourceFiles,
      plugins: {
        architecture: architectureBoundariesPlugin,
        clarity: typescriptClarityPlugin,
      },
      rules: {
        "clarity/no-default-export": "error",
        "clarity/no-export-all": "error",
        "clarity/no-namespace-import": "error",
        "clarity/no-renamed-import-export": [
          "error",
          {
            allowedImportAliases: [
              {
                source: "^@base-ui/react/",
                imported: "^(Button|Separator)$",
                local: "^(Button|Separator)Primitive$",
              },
              {
                source: "^pino$",
                imported: "^(Logger|LoggerOptions)$",
                local: "^Pino(Logger|LoggerOptions)$",
              },
              {
                source: "^@opentelemetry/api$",
                imported: "^(Counter|Histogram|Span)$",
                local: "^OpenTelemetry(Counter|Histogram|Span)$",
              },
            ],
          },
        ],
        "clarity/no-side-effect-import": "error",
        "clarity/no-variable-dynamic-import": "error",
        "architecture/enforce-import-boundaries": "error",
        "architecture/no-domain-ambient-infrastructure": "error",
        "architecture/public-entrypoint-contract": "error",
        "no-restricted-syntax": [
          "error",
          {
            selector: "TSEnumDeclaration",
            message: "Use a string union or literal constant object instead of enum.",
          },
          {
            selector: "TSParameterProperty",
            message: "Declare the field and constructor assignment explicitly.",
          },
          {
            selector: "TSImportEqualsDeclaration",
            message: "Use standard ESM imports instead of import-equals.",
          },
          {
            selector: "TSExportAssignment",
            message: "Use standard ESM named exports instead of export-equals.",
          },
          {
            selector: "CallExpression[callee.name='require']",
            message: "Use standard ESM imports instead of require().",
          },
          {
            selector: "AssignmentExpression[left.object.name='module'][left.property.name='exports']",
            message: "Use standard ESM named exports instead of module.exports.",
          },
        ],
      },
    },
    globalIgnores(["build/**", "coverage/**", "dist/**"]),
  ]);
}
