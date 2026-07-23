import { configDefaults, defineConfig } from "vitest/config";

interface NodeTestConfigOptions {
  exclude?: string[];
  include: string[];
}

export function createNodeTestConfig({ exclude = [], include }: NodeTestConfigOptions) {
  return defineConfig({
    test: {
      clearMocks: true,
      environment: "node",
      exclude: [
        ...configDefaults.exclude,
        "**/.next/**",
        "**/playwright-report/**",
        "**/test-results/**",
        ...exclude,
      ],
      globals: false,
      include,
      restoreMocks: true,
      watch: false,
    },
  });
}
