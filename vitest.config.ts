import { createNodeTestConfig } from "@support/test-config/vitest-node";

export default createNodeTestConfig({
  include: ["scripts/**/*.test.mjs"],
});
