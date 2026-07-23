import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export function createNodeConfig() {
  return defineConfig([
    eslint.configs.recommended,
    {
      files: ["**/*.{js,mjs,cjs}"],
      languageOptions: {
        ecmaVersion: "latest",
        globals: globals.node,
      },
      linterOptions: {
        reportUnusedDisableDirectives: "error",
        reportUnusedInlineConfigs: "error",
      },
      rules: {
        curly: ["error", "all"],
        "no-param-reassign": "error",
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
