# Repository commit history route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/commits/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for commit history at a ref and optional path.
This route returns 404. Support does not model Git refs, commits, or file history.
