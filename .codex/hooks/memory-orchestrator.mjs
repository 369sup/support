// Compatibility shim for a Codex task that loaded the retired hook definition
// before this repository switched to official user-level `serena-hooks`.
// New tasks do not reference this module.
export async function run() {
  process.stdout.write("{}\n");
}
