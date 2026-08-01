import { createNodeTestConfig } from "@support/testing-config/vitest-node";

export default createNodeTestConfig({
  include: ["scripts/**/*.test.mjs"],
});
