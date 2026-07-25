# Pull request route

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/pull/{*pullPath}`
- Status: excluded
- Summary: Reserved route for a pull request and its commits, checks, or files subpages.
This route returns 404. Support does not model pull requests or code review.
