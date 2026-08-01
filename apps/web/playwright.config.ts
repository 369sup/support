import { createPlaywrightConfig } from "@support/testing-config/playwright";

export default createPlaywrightConfig({
  baseURL: "http://127.0.0.1:3100",
  testDir: "./tests/e2e",
  webServerCommand:
    "node node_modules/next/dist/bin/next start --port 3100",
  webServerEnvironment: {
    SUPPORT_IN_MEMORY_RUNTIME: "enabled",
  },
});
