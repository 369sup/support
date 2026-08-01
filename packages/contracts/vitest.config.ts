import { createNodeTestConfig } from "@support/testing-config/vitest-node";

export default createNodeTestConfig({
  include: ["tests/**/*.test.ts"],
});
