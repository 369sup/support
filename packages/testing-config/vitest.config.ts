import { createNodeTestConfig } from "./src/vitest-node";

export default createNodeTestConfig({
  include: ["tests/**/*.test.ts"],
});
