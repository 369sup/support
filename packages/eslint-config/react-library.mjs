import { defineConfig } from "eslint/config";

import { createNextConfig } from "./next.mjs";

export function createReactLibraryConfig({ tsconfigRootDir }) {
  return defineConfig([
    ...createNextConfig({ tsconfigRootDir }),
    {
      rules: {
        "@next/next/no-html-link-for-pages": "off",
      },
    },
  ]);
}
