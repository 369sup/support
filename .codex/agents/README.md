# Project custom agents

Project-specific custom agents are registered in
[`../config.toml`](../config.toml):

- [`requirements.toml`](requirements.toml) turns an ambiguous task into a
  read-only execution contract.
- [`reviewer.toml`](reviewer.toml) reviews completed changes for actionable
  correctness, security, architecture, regression, and verification risks.
- [`verifier.toml`](verifier.toml) runs scoped verification and reports evidence
  without implementing fixes.

`requirements.toml` in this directory is a custom agent profile. It is not the
administrator-enforced Codex `requirements.toml` policy file.

Codex built-in `explorer` and `worker` agents continue to own general codebase
exploration and implementation. Documentation lookup remains a task instruction
or skill. Follow [`../AGENTS.md`](../AGENTS.md) before adding another role.
