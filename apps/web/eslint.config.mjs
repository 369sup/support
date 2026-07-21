import { createNextConfig } from "@support/eslint-config/next";

export default createNextConfig({
  tsconfigRootDir: import.meta.dirname,
});
