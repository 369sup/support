# GitHub Collaboration and Automation

Scope: `.github/**`. This file owns active GitHub workflows and contribution
templates; repository-wide change rules remain in
[`../AGENTS.md`](../AGENTS.md) and [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## Active assets

- [`workflows/ci.yml`](workflows/ci.yml) runs architecture, quality, build, and
  end-to-end verification.
- [`workflows/governance.yml`](workflows/governance.yml) performs scheduled or
  manually dispatched read-only knowledge-governance validation.
- [`PULL_REQUEST_TEMPLATE/default.md`](PULL_REQUEST_TEMPLATE/default.md) is the
  active pull request evidence template.

No issue form, CODEOWNERS file, Dependabot policy, security-reporting policy, or
Codex GitHub Action is currently active. Add one only when its owners,
permissions, inputs, and operating workflow are defined.

## Workflow invariants

- Declare the event, actor scope, branch scope, side effects, concurrency, and
  timeout.
- Default `GITHUB_TOKEN` to `contents: read`; elevate only the job and
  permission that require a write.
- Treat issue and pull request text, comments, commit metadata, diffs, generated
  files, and action outputs as untrusted input. Never interpolate them directly
  into executable shell.
- Never expose secrets to forks or untrusted events. Keep secrets in GitHub
  secret storage and ensure logs and artifacts cannot reveal them.
- Pin action versions deliberately and review their provenance.
- Keep commands aligned with `package.json` and applicable `AGENTS.md` files.
- Use `persist-credentials: false` for read-only checkout jobs.
- Treat workflow changes as executable infrastructure, not documentation-only
  edits.

## Templates and future Codex automation

The pull request template collects purpose, boundary and risk, observed
evidence, skipped checks, and rollback information. Keep detailed policy in its
authoritative document and link to it rather than copying it into templates.

If a Codex GitHub Action is later authorized, keep the event and permissions in
one workflow and any stable task prompt under `.github/codex/prompts/`. A
review-only job receives no write permission. The prompt must treat event
payload text as data, follow the repository `AGENTS.md` chain, and contain no
secret or private incident content.

## Verification

After changing `.github/**`:

1. Parse YAML and check every referenced path and command.
2. Review effective permissions, fork behavior, secrets, concurrency, and
   timeouts job by job.
3. Run the narrowest repository validation represented by the changed workflow.
4. Inspect the actual diff and state any behavior that can only be verified by
   a GitHub-hosted run.

Official references:

- <https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax>
- <https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions>
- <https://github.com/openai/codex-action>
