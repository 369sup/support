# Repository blob routes

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL family: `/{owner}/{repository}/blob/{ref}/{path}`
- Status: excluded
- Summary: Reserved GitHub-style repository file namespace.
This route returns 404. Git blobs and repository file content are outside the Support product boundary.
