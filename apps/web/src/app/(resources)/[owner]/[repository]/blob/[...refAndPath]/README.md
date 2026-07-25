# Repository blob route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/blob/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for a repository file at a ref.
This route returns 404. Support does not model Git blobs, refs, or source files.
