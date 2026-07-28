import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

import { createNodeTestConfig } from "@support/testing-config/vitest-node";

process.env["SUPPORT_DEVELOPMENT_AUTH_PASSWORD"] ??=
  randomBytes(24).toString("base64url");

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
