# Repository tree route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/tree/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for a repository tree at a ref and optional path.
This route returns 404. Support does not model Git trees, refs, directories, or files.
