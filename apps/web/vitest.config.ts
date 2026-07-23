import { createNodeTestConfig } from "@support/testing-config/vitest-node";

export default createNodeTestConfig({
  include: ["*.test.ts", "src/modules/**/*.test.ts"],
});
