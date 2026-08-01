import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

import { typescriptClarityPlugin } from "./src/eslint-rules/typescript-clarity.mjs";

const moduleFiles = ["**/*.{js,mjs,cjs}"];
const loaderConfigFiles = ["eslint.config.{js,mjs,cjs}"];

export default defineConfig([
  eslint.configs.recommended,
  {
    files: moduleFiles,
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
  globalIgnores(["coverage/**"]),
]);
