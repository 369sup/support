import { afterEach, describe, expect, it, vi } from "vitest";

import { createPlaywrightConfig } from "../src/playwright";
import { createNodeTestConfig } from "../src/vitest-node";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createNodeTestConfig", () => {
  it("applies deterministic Node defaults and standard artifact exclusions", () => {
    const config = createNodeTestConfig({
      exclude: ["src/**/*.node.test.ts"],
      include: ["src/**/*.test.ts"],
    });

    expect(config).toMatchObject({
      test: {
        clearMocks: true,
        environment: "node",
        globals: false,
        include: ["src/**/*.test.ts"],
        restoreMocks: true,
        watch: false,
      },
    });
    expect(config).toHaveProperty(
      "test.exclude",
      expect.arrayContaining([
        "**/.next/**",
        "**/playwright-report/**",
        "**/test-results/**",
        "src/**/*.node.test.ts",
      ]),
    );
  });
});

describe("createPlaywrightConfig", () => {
  const options = {
    baseURL: "http://127.0.0.1:3100",
    testDir: "./tests/e2e",
    webServerCommand: "pnpm start:e2e",
  };

  it("uses parallel local defaults and standard artifact locations", () => {
    vi.stubEnv("CI", "");

    expect(createPlaywrightConfig(options)).toMatchObject({
      forbidOnly: false,
      fullyParallel: true,
      outputDir: "test-results",
      retries: 0,
      testDir: "./tests/e2e",
      use: {
        baseURL: "http://127.0.0.1:3100",
        screenshot: "only-on-failure",
        trace: "on-first-retry",
        video: "on-first-retry",
      },
      webServer: {
        command: "pnpm start:e2e",
        reuseExistingServer: true,
      },
    });
  });

  it("serializes CI execution and enables retries", () => {
    vi.stubEnv("CI", "true");

    expect(createPlaywrightConfig(options)).toMatchObject({
      forbidOnly: true,
      retries: 2,
      webServer: { reuseExistingServer: false },
      workers: 1,
    });
  });
});
