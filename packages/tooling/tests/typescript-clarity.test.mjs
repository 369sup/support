import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";

import { typescriptClarityPlugin } from "../src/eslint-rules/typescript-clarity.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    parser: tseslint.parser,
    sourceType: "module",
  },
});

ruleTester.run(
  "no-renamed-import-export",
  typescriptClarityPlugin.rules["no-renamed-import-export"],
  {
    valid: [
      'import { createUser } from "./users";',
      {
        code: 'import { Button as ButtonPrimitive } from "@base-ui/react/button";',
        options: [
          {
            allowedImportAliases: [
              {
                source: "^@base-ui/react/",
                imported: "^Button$",
                local: "^ButtonPrimitive$",
              },
            ],
          },
        ],
      },
    ],
    invalid: [
      {
        code: 'import { createUser as run } from "./users";',
        errors: [{ messageId: "renamedImport" }],
      },
      {
        code: 'export { createUser as register } from "./users";',
        errors: [{ messageId: "renamedExport" }],
      },
    ],
  }
);

ruleTester.run(
  "no-default-export",
  typescriptClarityPlugin.rules["no-default-export"],
  {
  valid: ["export function createUser() {}"],
  invalid: [
    {
      code: "export default function createUser() {}",
      errors: [{ messageId: "defaultExport" }],
    },
  ],
  },
);

ruleTester.run("no-export-all", typescriptClarityPlugin.rules["no-export-all"], {
  valid: ['export { createUser } from "./users";'],
  invalid: [
    {
      code: 'export * from "./users";',
      errors: [{ messageId: "exportAll" }],
    },
  ],
});

ruleTester.run(
  "no-namespace-import",
  typescriptClarityPlugin.rules["no-namespace-import"],
  {
  valid: ['import { formatDate } from "./dates";'],
  invalid: [
    {
      code: 'import * as helpers from "./helpers";',
      errors: [{ messageId: "namespaceImport" }],
    },
  ],
  },
);

ruleTester.run(
  "no-variable-dynamic-import",
  typescriptClarityPlugin.rules["no-variable-dynamic-import"],
  {
    valid: ['import("./report")', "import(`./report`)"],
    invalid: [
      {
        code: "import(modulePath)",
        errors: [{ messageId: "variableImport" }],
      },
      {
        code: "import(`./reports/${reportType}`)",
        errors: [{ messageId: "variableImport" }],
      },
    ],
  }
);

ruleTester.run(
  "no-side-effect-import",
  typescriptClarityPlugin.rules["no-side-effect-import"],
  {
    valid: [
      'import { registerMonitoring } from "./monitoring";',
      {
        code: 'import "server-only";',
        options: [{ allowedModules: ["server-only"] }],
      },
    ],
    invalid: [
      {
        code: 'import "./register-monitoring";',
        errors: [{ messageId: "sideEffectImport" }],
        options: [{ allowedModules: ["server-only"] }],
      },
    ],
  },
);

ruleTester.run(
  "no-client-route-shell",
  typescriptClarityPlugin.rules["no-client-route-shell"],
  {
    valid: ['export default function Page() { return "server"; }'],
    invalid: [
      {
        code: '"use client";\nexport default function Page() { return "client"; }',
        errors: [{ messageId: "clientRouteShell" }],
      },
    ],
  },
);

ruleTester.run(
  "no-focused-or-disabled-tests",
  typescriptClarityPlugin.rules["no-focused-or-disabled-tests"],
  {
    valid: [
      'test("works", () => {});',
      'test.describe("flow", () => {});',
    ],
    invalid: [
      {
        code: 'test.only("focused", () => {});',
        errors: [{ messageId: "disabledTest" }],
      },
      {
        code: 'test.describe.skip("disabled", () => {});',
        errors: [{ messageId: "disabledTest" }],
      },
      {
        code: 'it.fixme("deferred", () => {});',
        errors: [{ messageId: "disabledTest" }],
      },
      {
        code: 'test.todo("not implemented");',
        errors: [{ messageId: "disabledTest" }],
      },
    ],
  },
);

ruleTester.run(
  "no-fixed-test-wait",
  typescriptClarityPlugin.rules["no-fixed-test-wait"],
  {
    valid: ["await expect(page.getByRole('status')).toBeVisible();"],
    invalid: [
      {
        code: "await page.waitForTimeout(1_000);",
        errors: [{ messageId: "fixedWait" }],
      },
    ],
  },
);

ruleTester.run(
  "no-uncontrolled-test-sources",
  typescriptClarityPlugin.rules["no-uncontrolled-test-sources"],
  {
    valid: [
      "const now = clock.now();",
      "const timestamp = new Date('2026-07-24T00:00:00Z');",
      "await httpClient.get('/health');",
    ],
    invalid: [
      {
        code: "const now = Date.now();",
        errors: [{ messageId: "uncontrolledSource" }],
      },
      {
        code: "const current = new Date();",
        errors: [{ messageId: "uncontrolledSource" }],
      },
      {
        code: "const value = Math.random();",
        errors: [{ messageId: "uncontrolledSource" }],
      },
      {
        code: "await fetch('/health');",
        errors: [{ messageId: "uncontrolledSource" }],
      },
      {
        code: "setTimeout(handleTimeout, 100);",
        errors: [{ messageId: "uncontrolledSource" }],
      },
    ],
  },
);
