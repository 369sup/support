import assert from "node:assert/strict";
import test from "node:test";

import {
  estimateTokens,
  managedMemoryName,
  memoryLimits,
} from "./policy.mjs";
import {
  renderDurableMemory,
  renderIndex,
  renderUnresolved,
} from "./render.mjs";

function entry(overrides = {}) {
  return {
    authority: "verified-result",
    confidence: 0.9,
    evidence: [
      {
        reference: "scripts/memory/engine.test.mjs",
        type: "repository-file",
      },
    ],
    expiresAt: "2026-10-21T00:00:00.000Z",
    invalidatedBy: ["The memory engine contract changes."],
    kind: "verified-result",
    lastConfirmedAt: "2026-07-23T00:00:00.000Z",
    scope: "repository",
    statement: "The automatic memory engine passed its focused verification.",
    status: "confirmed",
    subject: "automatic-memory-verification",
    ...overrides,
  };
}

test("renders bounded durable memories and deliberate-read references", () => {
  const durableEntry = entry();
  const renderedMemory = renderDurableMemory(durableEntry);
  const renderedIndex = renderIndex([durableEntry], {
    includeCurrentTask: true,
  });

  assert.match(renderedMemory, /## Statement/);
  assert.match(renderedMemory, /## Revalidate when/);
  assert.match(renderedIndex, /`mem:local\/current-task`/);
  assert.match(
    renderedIndex,
    new RegExp(`\`mem:${managedMemoryName(durableEntry)}\``),
  );
  assert.equal(
    estimateTokens(renderedMemory) <= memoryLimits.durableMemoryTokens,
    true,
  );
});

test("compresses an oversized index without truncating knowledge statements", () => {
  const entries = Array.from({ length: 100 }, (_, index) =>
    entry({
      statement: `Verified statement ${index}.`,
      subject: `automatic-memory-verification-${index.toString().padStart(3, "0")}`,
    }),
  );
  const rendered = renderIndex(entries, { includeCurrentTask: true });

  assert.equal(estimateTokens(rendered) <= memoryLimits.indexTokens, true);
  assert.match(rendered, /additional managed memories are available by topic/);
  assert.equal(rendered.includes(entries[0].statement), false);
});

test("rejects a durable rendering that exceeds its token budget", () => {
  assert.throws(
    () =>
      renderDurableMemory(
        entry({
          evidence: Array.from({ length: 6 }, (_, index) => ({
            reference: `docs/${index}/${"e".repeat(220)}`,
            type: "repository-file",
          })),
          invalidatedBy: Array.from(
            { length: 6 },
            (_, index) => `Condition ${index}: ${"i".repeat(160)}`,
          ),
          statement: "s".repeat(600),
        }),
      ),
    /exceeds the durable-memory token budget/,
  );
});

test("keeps unresolved rendering within budget while preserving manifest state", () => {
  const conflicts = Array.from({ length: 40 }, (_, index) => ({
    existing: {
      authority: "verified-result",
      statement: `Existing statement ${index}: ${"e".repeat(120)}`,
    },
    identity: `decision:repository:conflict-${index}`,
    incoming: {
      authority: "verified-result",
      statement: `Incoming statement ${index}: ${"i".repeat(120)}`,
    },
    recordedAt: `2026-07-23T00:00:${index.toString().padStart(2, "0")}.000Z`,
    resolution: "manual-review-required",
    status: "unresolved",
  }));
  const rendered = renderUnresolved(conflicts);

  assert.equal(
    estimateTokens(rendered) <= memoryLimits.durableMemoryTokens,
    true,
  );
  assert.match(rendered, /additional conflicts remain in the managed manifest/);
});
