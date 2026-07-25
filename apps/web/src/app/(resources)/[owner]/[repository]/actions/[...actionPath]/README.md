# Repository Actions subroute

For Codex 5.3 startup, read the corresponding AGENTS.md chain first for authority, then this README only for behavior/context details.
- URL pattern: `/{owner}/{repository}/actions/{*actionPath}`
- Status: excluded
- Summary: Reserved route for workflows, runs, jobs, caches, and related Actions views.
This route returns 404. Support does not model code workflows or their executions.
