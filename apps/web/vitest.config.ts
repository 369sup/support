import { fileURLToPath } from "node:url";

import { createNodeTestConfig } from "@support/testing-config/vitest-node";

const config = createNodeTestConfig({
  include: ["*.test.ts", "src/modules/**/*.test.ts"],
});

const webTestConfig = {
  ...config,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
};

export default webTestConfig;
