# Repository branch view route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/branches/{view}`
- Status: excluded
- Summary: Reserved route for branch views such as active, stale, or all.
This route returns 404. Support does not model Git branches or their activity state.
