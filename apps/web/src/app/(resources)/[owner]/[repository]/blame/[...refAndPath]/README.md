# Repository blame route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/blame/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for file blame at a ref.
This route returns 404. Support does not model commits or line-level authorship.
