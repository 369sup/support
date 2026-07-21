import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import architecture from "./rules/architecture-boundaries.mjs";
import clarity from "./rules/typescript-clarity.mjs";

export function createNextConfig({ tsconfigRootDir }) {
  const typedFiles = ["**/*.{ts,tsx,mts,cts}"];
  const sourceFiles = ["src/**/*.{ts,tsx,mts,cts}"];
  const nextDefaultExportFiles = [
    "src/app/**/{page,layout,template,default,loading,error,global-error,not-found}.{ts,tsx}",
    "src/app/{manifest,robots,sitemap}.{ts,tsx}",
  ];

  return defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  {
    files: typedFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      architecture,
      clarity,
    },
    rules: {
      "curly": ["error", "all"],
      "no-cond-assign": ["error", "always"],
      "no-implicit-coercion": [
        "error",
        { allow: [], boolean: true, disallowTemplateShorthand: true, number: true, string: true },
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
  {
    files: nextDefaultExportFiles,
    rules: {
      "clarity/no-default-export": "off",
    },
  },
  {
    files: ["src/app/layout.{ts,tsx}"],
    rules: {
      "clarity/no-side-effect-import": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ]);
}
