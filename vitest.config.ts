import { createNodeTestConfig } from "@support/testing-config/vitest-node";

export default createNodeTestConfig({
  exclude: ["scripts/memory/**/*.test.mjs"],
  include: ["scripts/**/*.test.mjs"],
});
