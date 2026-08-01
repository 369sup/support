import eslint from "@eslint/js";
import { typescriptClarityPlugin } from "@support/tooling/eslint-rules/typescript-clarity";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export function createNodeConfig() {
  const moduleFiles = ["**/*.{js,mjs,cjs}"];
  /*
   * Loader exception: ESLint and the named build/test tools consume a default
   * configuration export. Scope is limited to these config filenames; ordinary
   * modules remain protected. The impact is confined to tool bootstrap APIs,
   * named exports are not uniformly supported by their loaders, and the
   * exception is contained by lint plus the affected tool startup checks.
   */
  const loaderConfigFiles = [
    "**/{eslint,next,playwright,postcss,vitest}.config.{js,mjs,cjs}",
  ];

  return defineConfig([
    eslint.configs.recommended,
    {
      files: moduleFiles,
      languageOptions: {
        ecmaVersion: "latest",
        globals: globals.node,
      },
      linterOptions: {
        reportUnusedDisableDirectives: "error",
        reportUnusedInlineConfigs: "error",
      },
      plugins: {
        clarity: typescriptClarityPlugin,
      },
      rules: {
        "clarity/no-default-export": "error",
        "clarity/no-export-all": "error",
        "clarity/no-namespace-import": "error",
        "clarity/no-renamed-import-export": "error",
        "clarity/no-side-effect-import": "error",
        "clarity/no-variable-dynamic-import": "error",
        curly: ["error", "all"],
        "no-eval": "error",
        "no-extend-native": "error",
        "no-nested-ternary": "error",
        "no-new-func": "error",
        "no-param-reassign": "error",
        "no-sequences": "error",
        "no-unused-expressions": "error",
      },
    },
    {
      files: loaderConfigFiles,
      rules: {
        "clarity/no-default-export": "off",
      },
    },
    globalIgnores([
      "**/.next/**",
      "**/.turbo/**",
      "**/build/**",
      "**/coverage/**",
      "**/dist/**",
      "**/node_modules/**",
    ]),
  ]);
}
