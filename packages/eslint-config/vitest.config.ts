import { createNodeTestConfig } from "@support/test-config/vitest-node";

export default createNodeTestConfig({
  include: ["rules/**/*.test.mjs"],
});
