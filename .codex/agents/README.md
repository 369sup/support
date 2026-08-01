# Project custom agents

Registered project custom agents live here as `<agent-name>.toml`. The active
roles are `explorer`, `implementer`, `reviewer`, `verifier`, and
`docs-researcher`; their registrations live in [`../config.toml`](../config.toml).

Each active file must define `name`, `description`, and
`developer_instructions`. Keep roles narrow, inherit the parent model unless a
role has a demonstrated need for an override, and follow
[`../AGENTS.md`](../AGENTS.md).
