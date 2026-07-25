# Repository archive route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/archive/{*archivePath}`
- Status: excluded
- Summary: Reserved route for branch, tag, or commit source archives.
This route returns 404. Support does not package or serve Git repository contents.
