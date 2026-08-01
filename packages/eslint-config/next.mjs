import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import { createTypeScriptLibraryConfig } from "./typescript-library.mjs";

function promoteWarningsToErrors(config) {
  if (config.rules === undefined) {
    return config;
  }

  const rules = Object.fromEntries(
    Object.entries(config.rules).map(([name, value]) => {
      if (value === "warn" || value === 1) {
        return [name, "error"];
      }

      if (Array.isArray(value) && (value[0] === "warn" || value[0] === 1)) {
        return [name, ["error", ...value.slice(1)]];
      }

      return [name, value];
    }),
  );

  return { ...config, rules };
}

export function createNextConfig({ tsconfigRootDir }) {
  const nextDefaultExportFiles = [
    "src/app/**/{page,layout,template,default,loading,error,global-error,not-found}.{ts,tsx}",
    "src/app/{manifest,robots,sitemap}.{ts,tsx}",
  ];

  return defineConfig([
    ...nextVitals.map(promoteWarningsToErrors),
    ...nextTs.map(promoteWarningsToErrors),
    ...createTypeScriptLibraryConfig({ tsconfigRootDir }),
    {
      files: ["src/**/*.{jsx,tsx}"],
      rules: {
        "react/jsx-handler-names": [
          "error",
          {
            checkInlineFunction: false,
            checkLocalVariables: true,
            eventHandlerPrefix: "handle",
            eventHandlerPropPrefix: "on",
          },
        ],
        "react/no-array-index-key": "error",
        "react/no-unstable-nested-components": "error",
      },
    },
    {
      files: ["src/app/**/route.{ts,tsx}"],
      rules: {
        "@typescript-eslint/explicit-module-boundary-types": "error",
      },
    },
    {
      files: ["src/app/**/{page,layout}.{ts,tsx}"],
      rules: {
        "clarity/no-client-route-shell": "error",
      },
    },
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
