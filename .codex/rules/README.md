# Project command rules

Optional experimental command-policy files live here as `<rule-name>.rules`.

`workspace-validation.rules` allows only the repository's canonical `pnpm`
validation scripts to run outside the sandbox without repeated approval.
Package installation, arbitrary executables, development servers, deployment,
and Git mutations remain outside that allowlist.

Add only narrow reviewed prefixes with justification plus positive and
negative matching examples. Follow [../AGENTS.md](../AGENTS.md).
