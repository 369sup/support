import { strict } from "node:assert";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { test } from "vitest";

test("exits with configuration status for an invalid profile", () => {
  const scriptPath = resolve(
    import.meta.dirname,
    "architecture.mjs",
  );
  const result = spawnSync(
    process.execPath,
    [scriptPath, "check", "--profile=unsupported"],
    {
      encoding: "utf8",
    },
  );

  strict.equal(result.status, 2);
  strict.match(
    result.stderr,
    /Architecture check configuration failed: Invalid architecture profile unsupported/,
  );
});
