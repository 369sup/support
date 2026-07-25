# Repository raw route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/raw/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for raw repository content at a ref.
This route returns 404. Support does not serve Git-backed raw files.
