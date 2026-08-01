import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { createTypeScriptLibraryConfig } from "./typescript-library.mjs";

export function createNextConfig({ tsconfigRootDir }) {
  const nextDefaultExportFiles = [
    "src/app/**/{page,layout,template,default,loading,error,global-error,not-found}.{ts,tsx}",
    "src/app/{manifest,robots,sitemap}.{ts,tsx}",
  ];

  return defineConfig([
    ...nextVitals,
    ...nextTs,
    ...createTypeScriptLibraryConfig({ tsconfigRootDir }),
    {
      files: nextDefaultExportFiles,
      rules: {
        "clarity/no-default-export": "off",
      },
    },
    {
      files: ["src/app/layout.{ts,tsx}"],
      rules: {
        "clarity/no-side-effect-import": "off",
      },
    },
    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]),
  ]);
}
