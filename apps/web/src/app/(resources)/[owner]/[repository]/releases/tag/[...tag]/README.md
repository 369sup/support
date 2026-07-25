# Tagged repository release route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/releases/tag/{*tag}`
- Status: deferred
- Summary: Reserved route for a release addressed by a potentially nested tag name.
This route returns 404. Support does not yet model release lookup by tag.
