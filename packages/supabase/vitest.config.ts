import { fileURLToPath } from "node:url";

import { createNodeTestConfig } from "@support/testing-config/vitest-node";

const config = createNodeTestConfig({
  include: ["tests/**/*.test.ts"],
});

export default {
  ...config,
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
};
