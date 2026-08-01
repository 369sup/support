import { defineConfig, devices } from "@playwright/test";

interface PlaywrightConfigOptions {
  baseURL: string;
  testDir: string;
  webServerCommand: string;
}

export function createPlaywrightConfig({
  baseURL,
  testDir,
  webServerCommand,
}: PlaywrightConfigOptions) {
  const isContinuousIntegration = Boolean(process.env["CI"]);

  return defineConfig({
    forbidOnly: isContinuousIntegration,
    fullyParallel: true,
    outputDir: "test-results",
    projects: [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
      },
    ],
    reporter: [
      ["list"],
      ["html", { open: "never", outputFolder: "playwright-report" }],
    ],
    retries: isContinuousIntegration ? 2 : 0,
    testDir,
    use: {
      baseURL,
      screenshot: "only-on-failure",
      trace: "on-first-retry",
      video: "on-first-retry",
    },
    webServer: {
      command: webServerCommand,
      reuseExistingServer: !isContinuousIntegration,
      stderr: "pipe",
      stdout: "ignore",
      timeout: 120_000,
      url: baseURL,
    },
    ...(isContinuousIntegration ? { workers: 1 } : {}),
  });
}
