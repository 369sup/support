import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  parseCandidateBundleFromTask,
  renderCandidateBundleTemplate,
  validateCandidateBundle,
} from "./schema.mjs";

async function repositoryFixture() {
  return mkdtemp(join(tmpdir(), "support-memory-schema-"));
}

function candidate(overrides = {}) {
  return {
    authority: "user-decision",
    confidence: 1,
    durability: "durable",
    evidence: [
      {
        reference: "approved-task-plan",
        type: "user-instruction",
      },
    ],
    invalidatedBy: ["The accepted decision changes."],
    kind: "decision",
    scope: "repository",
    statement: "Shared memories remain generated from canonical repository authorities.",
    status: "confirmed",
    subject: "Shared memory authority",
    ...overrides,
  };
}

function bundle(overrides = {}) {
  return {
    candidates: [candidate()],
    checkpointToken: "a".repeat(48),
    disposition: "distill",
    schemaVersion: 1,
    ...overrides,
  };
}

test("validates and normalizes a strict candidate bundle", async () => {
  const root = await repositoryFixture();
  const result = validateCandidateBundle(root, bundle());

  assert.equal(result.candidates[0].subject, "shared-memory-authority");
  assert.equal(
    result.candidates[0].statement,
    "Shared memories remain generated from canonical repository authorities.",
  );
});

test("rejects unknown fields, secrets, oversized statements, and path escape", async () => {
  const root = await repositoryFixture();
  assert.throws(
    () => validateCandidateBundle(root, { ...bundle(), extra: true }),
    /unsupported field/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(
        root,
        bundle({
          candidates: [
            candidate({
              statement: `Use api_key=${"x".repeat(20)} for the provider.`,
            }),
          ],
        }),
      ),
    /sensitive value/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(
        root,
        bundle({
          candidates: [
            candidate({
              statement: "x".repeat(601),
            }),
          ],
        }),
      ),
    /600 characters/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(
        root,
        bundle({
          candidates: [
            candidate({
              authority: "canonical",
              evidence: [
                {
                  reference: "../outside.md",
                  type: "repository-file",
                },
              ],
            }),
          ],
        }),
      ),
    /stay inside the repository/,
  );
});

test("enforces disposition, checkpoint token, and canonical evidence", async () => {
  const root = await repositoryFixture();
  assert.throws(
    () =>
      validateCandidateBundle(root, {
        ...bundle(),
        disposition: "no-memory",
      }),
    /zero candidates/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(root, bundle(), {
        expectedCheckpointToken: "b".repeat(48),
      }),
    /stale or invalid/,
  );
  assert.throws(
    () =>
      validateCandidateBundle(
        root,
        bundle({
          candidates: [
            candidate({
              authority: "canonical",
            }),
          ],
        }),
      ),
    /repository-file evidence/,
  );
});

test("extracts exactly one marked JSON bundle from current-task", async () => {
  const root = await repositoryFixture();
  const token = "c".repeat(48);
  const task = [
    "# Current task",
    "",
    "## Objective",
    "",
    "Test the memory workflow.",
    "",
    renderCandidateBundleTemplate(token),
  ].join("\n");
  const parsed = parseCandidateBundleFromTask(root, task, {
    expectedCheckpointToken: token,
  });

  assert.equal(parsed.disposition, "no-memory");
  assert.throws(
    () =>
      parseCandidateBundleFromTask(
        root,
        `${task}\n${renderCandidateBundleTemplate(token)}`,
      ),
    /exactly one/,
  );
});

