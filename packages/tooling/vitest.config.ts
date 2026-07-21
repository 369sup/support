import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    exclude: [
      ...configDefaults.exclude,
      "**/.next/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
    globals: false,
    include: ["tests/**/*.test.mjs"],
    restoreMocks: true,
    watch: false,
  },
});
