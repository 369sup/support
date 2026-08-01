# Repository commit history route
- URL pattern: `/{owner}/{repository}/commits/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for commit history at a ref and optional path.
This route returns 404. Support does not model Git refs, commits, or file history.
