import { strict } from "node:assert";
import { resolve } from "node:path";
import { test } from "vitest";

import { ESLint } from "eslint";

const eslint = new ESLint({
  cwd: resolve("apps/web"),
  overrideConfigFile: "eslint.config.mjs",
});
const rootEslint = new ESLint({
  cwd: resolve("."),
  overrideConfigFile: "eslint.config.mjs",
});
const toolingEslint = new ESLint({
  cwd: resolve("packages/tooling"),
  overrideConfigFile: "eslint.config.mjs",
});

function severityOf(value) {
  return Array.isArray(value) ? value[0] : value;
}

test("promotes imported Next, React, and accessibility warnings to errors", async () => {
  const config = await eslint.calculateConfigForFile(
    "src/app/global-error.tsx",
  );
  const warningRules = Object.entries(config.rules)
    .filter(([, value]) => severityOf(value) === 1)
    .map(([name]) => name)
    .sort();

  strict.deepEqual(warningRules, []);
}, 15_000);

test("enforces the shared TypeScript and React safety rules", async () => {
  const config = await eslint.calculateConfigForFile(
    "src/app/global-error.tsx",
  );

  for (const ruleName of [
    "@typescript-eslint/no-deprecated",
    "@typescript-eslint/no-explicit-any",
    "@typescript-eslint/no-floating-promises",
    "@typescript-eslint/naming-convention",
    "@typescript-eslint/no-non-null-assertion",
    "@typescript-eslint/no-restricted-types",
    "@typescript-eslint/switch-exhaustiveness-check",
    "id-length",
    "react-hooks/set-state-in-effect",
    "react-hooks/static-components",
    "react/jsx-handler-names",
    "react/no-array-index-key",
    "react/no-unstable-nested-components",
  ]) {
    strict.equal(severityOf(config.rules[ruleName]), 2, ruleName);
  }

  strict.deepEqual(
    config.rules["@typescript-eslint/consistent-type-assertions"],
    [2, { assertionStyle: "never" }],
  );
});

test("requires explicit return types at public application boundaries", async () => {
  for (const filePath of [
    "src/app/api/auth/session/route.ts",
    "src/modules/identity/authentication/server-api.ts",
    "src/modules/identity/authentication/application/ports/inbound/get-current-authenticated-session.use-case.ts",
  ]) {
    const config = await eslint.calculateConfigForFile(filePath);
    strict.equal(
      severityOf(
        config.rules["@typescript-eslint/explicit-module-boundary-types"],
      ),
      2,
      filePath,
    );
  }
});

test("keeps route shells on the server and tests deterministic", async () => {
  const pageConfig = await eslint.calculateConfigForFile(
    "src/app/(console)/layout.tsx",
  );
  const endToEndConfig = await eslint.calculateConfigForFile(
    "tests/e2e/routes.spec.ts",
  );
  const unitConfig = await eslint.calculateConfigForFile(
    "same-origin.test.ts",
  );

  strict.equal(
    severityOf(pageConfig.rules["clarity/no-client-route-shell"]),
    2,
  );
  strict.equal(
    severityOf(endToEndConfig.rules["clarity/no-fixed-test-wait"]),
    2,
  );
  strict.equal(
    severityOf(
      endToEndConfig.rules["clarity/no-focused-or-disabled-tests"],
    ),
    2,
  );
  strict.equal(
    severityOf(unitConfig.rules["clarity/no-uncontrolled-test-sources"]),
    2,
  );
});

test("requires predicate prefixes for Boolean names", async () => {
  const [invalidResult] = await eslint.lintText(
    "const enabled: boolean = true;",
    { filePath: "src/app/global-error.tsx" },
  );
  const [validResult] = await eslint.lintText(
    "const isEnabled: boolean = true;",
    { filePath: "src/app/global-error.tsx" },
  );

  strict.equal(
    invalidResult.messages.some((message) => {
      return message.ruleId === "@typescript-eslint/naming-convention";
    }),
    true,
  );
  strict.equal(
    validResult.messages.some((message) => {
      return message.ruleId === "@typescript-eslint/naming-convention";
    }),
    false,
  );
}, 20_000);

test("enforces module clarity in tests and preserves loader config exports", async () => {
  const testConfig = await eslint.calculateConfigForFile(
    "route-contracts.test.ts",
  );
  const loaderConfig = await eslint.calculateConfigForFile("vitest.config.ts");

  for (const ruleName of [
    "clarity/no-default-export",
    "clarity/no-export-all",
    "clarity/no-namespace-import",
    "clarity/no-renamed-import-export",
    "clarity/no-side-effect-import",
    "clarity/no-variable-dynamic-import",
  ]) {
    strict.equal(severityOf(testConfig.rules[ruleName]), 2, ruleName);
  }

  strict.equal(
    severityOf(loaderConfig.rules["clarity/no-default-export"]),
    0,
  );
});

test("enforces module clarity in root scripts and bootstrap tooling", async () => {
  const rootConfig = await rootEslint.calculateConfigForFile(
    "scripts/architecture.mjs",
  );
  const toolingConfig = await toolingEslint.calculateConfigForFile(
    "src/eslint-rules/architecture-boundaries.mjs",
  );

  for (const config of [rootConfig, toolingConfig]) {
    for (const ruleName of [
      "clarity/no-default-export",
      "clarity/no-export-all",
      "clarity/no-namespace-import",
      "clarity/no-renamed-import-export",
      "clarity/no-side-effect-import",
      "clarity/no-variable-dynamic-import",
      "no-nested-ternary",
    ]) {
      strict.equal(severityOf(config.rules[ruleName]), 2, ruleName);
    }
  }

  const [rootAliasResult] = await rootEslint.lintText(
    'import { strict as assert } from "node:assert";',
    { filePath: "scripts/example.mjs" },
  );
  const [toolingAliasResult] = await toolingEslint.lintText(
    'import { posix as path } from "node:path";',
    { filePath: "src/example.mjs" },
  );

  for (const result of [rootAliasResult, toolingAliasResult]) {
    strict.equal(
      result.messages.some((message) => {
        return message.ruleId === "clarity/no-renamed-import-export";
      }),
      true,
    );
  }
});
