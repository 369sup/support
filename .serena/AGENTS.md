# Serena Project Configuration Workflow

This file governs `.serena/**` only. Repository development rules remain in the
root and source-tree `AGENTS.md` files.

## Configuration boundary

- `project.yml` contains portable project discovery and backend settings for
  Serena. It is not a product configuration file or a substitute for Codex
  repository guidance.
- Keep workspace paths relative and inside the repository unless a reviewed
  cross-repository symbol requirement makes an additional folder necessary.
- Do not commit credentials, personal installation paths, IDE-specific user
  state, generated indexes, or Serena memories containing source or customer
  data.
- Keep `initial_prompt` empty unless a Serena-only invariant cannot live in the
  applicable `AGENTS.md`. Do not duplicate repository architecture there.
- Prefer the existing ignore model and narrow additions over manually listing
  generated directories already covered by `.gitignore`.

## Change workflow

Before changing backend, workspace, tool, activation-command, or read/write
settings, identify the effect on trust, command execution, indexing scope, and
cross-package references. Activation commands must be cross-platform,
non-interactive, time-bounded, and safe in a trusted checkout.

After changing `project.yml`, start or reactivate Serena from the repository
root and verify that `apps/web`, workspace packages, and cross-package symbols
are discoverable without indexing ignored build or dependency output. Treat a
successful configuration parse as necessary but not proof that the JetBrains
backend is connected.
