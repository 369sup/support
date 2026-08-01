import { strict } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "vitest";

import {
  architectureProfiles,
  architectureRuleIds,
  architectureRuleRegistry,
} from "@support/tooling/architecture/policy";

const repositoryRoot = resolve(import.meta.dirname, "..", "..");
const enforcementPaths = [
  "scripts/architecture.mjs",
  "scripts/architecture/governance.mjs",
  "scripts/architecture/routes.mjs",
  "scripts/architecture/source.mjs",
  "scripts/architecture/workspace.mjs",
  "packages/tooling/src/eslint-rules/architecture-boundaries.mjs",
];

function ruleIdsIn(contents) {
  return [
    ...new Set(
      [...contents.matchAll(/ARCH-[A-Z]+(?:-[A-Z]+)*-\d{3}/g)].map(
        (match) => match[0],
      ),
    ),
  ];
}

test("registers every emitted architecture rule exactly once", () => {
  strict.equal(
    new Set(architectureRuleIds).size,
    architectureRuleIds.length,
  );

  const emittedRuleIds = enforcementPaths.flatMap((relativePath) => {
    return ruleIdsIn(readFileSync(resolve(repositoryRoot, relativePath), "utf8"));
  });
  const emittedRuleIdSet = new Set(emittedRuleIds);

  for (const ruleId of emittedRuleIdSet) {
    strict.notEqual(
      architectureRuleRegistry[ruleId],
      undefined,
      `${ruleId} must exist in the shared architecture policy.`,
    );
  }

  for (const ruleId of architectureRuleIds) {
    strict.equal(
      emittedRuleIdSet.has(ruleId),
      true,
      `${ruleId} is registered but no enforcer emits it.`,
    );
  }
});

test("gives every registered rule complete enforcement metadata", () => {
  for (const [ruleId, policy] of Object.entries(architectureRuleRegistry)) {
    strict.match(ruleId, /^ARCH-[A-Z]+(?:-[A-Z]+)*-\d{3}$/);
    strict.equal(typeof policy.category, "string");
    strict.equal(policy.category.length > 0, true);
    strict.equal(
      architectureProfiles.includes(policy.gate) && policy.gate !== "all",
      true,
    );
    strict.equal(["checker", "eslint"].includes(policy.enforcer), true);
    strict.equal(typeof policy.summary, "string");
    strict.equal(policy.summary.length > 0, true);
  }
});

test("validates registered exception rule references", () => {
  const registry = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "docs",
        "architecture",
        "exceptions",
        "registry.json",
      ),
      "utf8",
    ),
  );

  for (const exception of registry) {
    strict.notEqual(
      architectureRuleRegistry[exception.rule],
      undefined,
      `${exception.id} references unregistered rule ${exception.rule}.`,
    );
  }
});
