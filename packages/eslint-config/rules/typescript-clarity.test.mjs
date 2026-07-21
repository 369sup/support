import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";

import clarity from "./typescript-clarity.mjs";

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
  clarity.rules["no-renamed-import-export"],
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

ruleTester.run("no-default-export", clarity.rules["no-default-export"], {
  valid: ["export function createUser() {}"],
  invalid: [
    {
      code: "export default function createUser() {}",
      errors: [{ messageId: "defaultExport" }],
    },
  ],
});

ruleTester.run("no-export-all", clarity.rules["no-export-all"], {
  valid: ['export { createUser } from "./users";'],
  invalid: [
    {
      code: 'export * from "./users";',
      errors: [{ messageId: "exportAll" }],
    },
  ],
});

ruleTester.run("no-namespace-import", clarity.rules["no-namespace-import"], {
  valid: ['import { formatDate } from "./dates";'],
  invalid: [
    {
      code: 'import * as helpers from "./helpers";',
      errors: [{ messageId: "namespaceImport" }],
    },
  ],
});

ruleTester.run(
  "no-variable-dynamic-import",
  clarity.rules["no-variable-dynamic-import"],
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

ruleTester.run("no-side-effect-import", clarity.rules["no-side-effect-import"], {
  valid: ['import { registerMonitoring } from "./monitoring";'],
  invalid: [
    {
      code: 'import "./register-monitoring";',
      errors: [{ messageId: "sideEffectImport" }],
    },
  ],
});
