# GitHub Actions workflows

`ci.yml` runs the affected full gate for pull requests and the complete full
gate on `main`. It uses the repository `TURBO_TOKEN` secret and `TURBO_TEAM`
variable for Vercel Remote Cache. When the token is unavailable, such as on a
fork pull request, it falls back to the GitHub Actions cache. Playwright
reports are uploaded on failure.

New workflows must define the event, trusted actors, minimum token permissions,
secrets, timeout, concurrency, and verification plan. For Codex jobs, keep
prompts under `../codex/prompts/` and follow [../AGENTS.md](../AGENTS.md).
