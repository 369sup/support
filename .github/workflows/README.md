# GitHub Actions workflows

`ci.yml` runs architecture/generated validation, quality checks, and build in
parallel. End-to-end tests depend on all three jobs, so Chromium is installed
only after the faster gates pass. Pull requests use Turbo affected execution;
`main` runs the complete task graph.

The workflow uses the repository `TURBO_TOKEN` secret and `TURBO_TEAM`
variable for Vercel Remote Cache. When the token is unavailable, such as on a
fork pull request, each job falls back to the GitHub Actions cache. Playwright
reports are uploaded only by a failed end-to-end job.

`governance.yml` is a read-only knowledge-governance workflow owned by the
repository architecture maintainers. It runs every Monday at 00:30 UTC or by
manual dispatch and reports source-age violations without becoming a pull
request merge gate.

New workflows must define the event, trusted actors, minimum token permissions,
secrets, timeout, concurrency, and verification plan. For Codex jobs, keep
prompts under `../codex/prompts/` and follow [../AGENTS.md](../AGENTS.md).
