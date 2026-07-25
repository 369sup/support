# Repository comparison route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/compare/{*comparison}`
- Status: excluded
- Summary: Reserved route for two-dot, three-dot, and cross-fork comparison identifiers.
This route returns 404. Support does not model Git revisions, merge bases, or diffs.
