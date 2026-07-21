import { configDefaults, defineConfig } from "vitest/config";

type NodeTestConfigOptions = {
  include: string[];
};

export function createNodeTestConfig({ include }: NodeTestConfigOptions) {
  return defineConfig({
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
      include,
      restoreMocks: true,
      watch: false,
    },
  });
}
