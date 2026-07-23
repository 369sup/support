# Repository blob route

- URL pattern: `/{owner}/{repository}/blob/{*refAndPath}`
- Status: excluded
- Summary: Reserved route for a repository file at a ref.

This route returns 404. Support does not model Git blobs, refs, or source files.
