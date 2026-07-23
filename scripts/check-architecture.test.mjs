import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { test } from "vitest";

test("exits with configuration status for an invalid profile", () => {
  const scriptPath = resolve(
    import.meta.dirname,
    "check-architecture.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [scriptPath, "--profile=unsupported"],
    {
      encoding: "utf8",
    },
  );

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /Architecture check configuration failed: Invalid architecture profile unsupported/,
  );
});
