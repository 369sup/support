import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  eslint.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
    rules: {
      curly: ["error", "all"],
      "no-param-reassign": "error",
    },
  },
  globalIgnores(["coverage/**"]),
]);
