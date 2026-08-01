import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

import { createPlaywrightConfig } from "@support/testing-config/playwright";

const localEnvironmentPath = resolve(process.cwd(), ".env.local");
if (existsSync(localEnvironmentPath)) {
  loadEnvFile(localEnvironmentPath);
}

const playwrightConfig = createPlaywrightConfig({
  baseURL: "http://127.0.0.1:3100",
  testDir: "./tests/e2e",
  webServerCommand:
    "node node_modules/next/dist/bin/next start --port 3100",
});

const configuredPlaywright = {
  ...playwrightConfig,
  testIgnore:
    process.env["SUPABASE_E2E_ENABLED"] === "true"
      ? []
      : ["**/supabase-auth.spec.ts"],
};

export default configuredPlaywright;
