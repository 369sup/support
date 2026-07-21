import { createPlaywrightConfig } from "@support/test-config/playwright";

export default createPlaywrightConfig({
  baseURL: "http://127.0.0.1:3100",
  testDir: "./tests/e2e",
  webServerCommand: "pnpm start:e2e",
});
