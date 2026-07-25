# Repository commit route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/commit/{sha}`
- Status: excluded
- Summary: Reserved route for a single commit identifier.
This route returns 404. Support does not model commit objects, diffs, or patches.
