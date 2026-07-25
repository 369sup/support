# Release asset download route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/releases/download/{*assetPath}`
- Status: deferred
- Summary: Reserved route for a tag and release asset path.
This route returns 404. Support does not yet resolve or serve release assets.
