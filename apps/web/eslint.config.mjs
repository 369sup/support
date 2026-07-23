import { globalIgnores } from "eslint/config";

import { createNextConfig } from "@support/eslint-config/next";

const config = [
  ...createNextConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  globalIgnores(["public/mockServiceWorker.js"]),
];

export default config;
