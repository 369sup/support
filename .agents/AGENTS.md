# Repository Agent Assets Contract

This file governs `.agents/` and everything below it.

`.agents` is the repository discovery surface for reusable Codex skills and
the repository plugin marketplace. It is not the project configuration folder,
not a plugin package, and not the repository-wide instruction root.

## Boundary map

```text
.agents/   = discover repo skills and the repo plugin marketplace
.codex/    = configure Codex for this trusted repository
.github/   = configure GitHub collaboration and CI automation
plugins/   = author installable plugin packages
AGENTS.md  = durable instructions for the directory subtree containing it
```

The `AGENTS.md` in this directory guides changes under `.agents/` only. It does
not replace a repository-root `AGENTS.md`.

## Canonical structure

```text
.agents/
├── AGENTS.md
├── skills/
│   ├── README.md
│   └── <skill-name>/
│       ├── SKILL.md                 # required; YAML name + description
│       ├── agents/
│       │   └── openai.yaml          # optional UI/dependency metadata
│       ├── scripts/                 # optional executable helpers
│       ├── references/              # optional progressive-disclosure docs
│       └── assets/                  # optional templates/static resources
└── plugins/
    ├── README.md
    └── marketplace.json             # repo plugin catalog; currently empty
```

Do not create placeholder folders literally named `<skill-name>`. Create a real
lowercase kebab-case skill directory only when its workflow is known.

## Choose skills or plugins deliberately

| Need | Correct location |
| --- | --- |
| Workflow used only in this repository | `.agents/skills/<skill-name>/` |
| Reusable/installable workflow bundle | `plugins/<plugin-name>/skills/` |
| Plugin catalog for this repository | `.agents/plugins/marketplace.json` |
| Codex model, sandbox, MCP, hook, rule, or custom-agent settings | `.codex/` |
| CI workflow or Codex GitHub Action prompt | `.github/` |

Do not duplicate one skill under both `.agents/skills` and `plugins/.../skills`.
Author it locally in `.agents/skills`, or package it in a plugin when it becomes
a distribution unit. Move it deliberately rather than maintaining two copies.

## Skill contract

Every skill directory requires `SKILL.md` with frontmatter:

```md
---
name: example-skill
description: State exactly when this skill should and should not trigger.
---

# Workflow

1. Read the necessary context.
2. Perform the bounded task.
3. Run explicit verification.
```

Rules:

1. Use lowercase kebab-case for the folder and `name`.
2. Make `description` specific enough for implicit discovery.
3. Keep the main workflow in `SKILL.md`; put long background material in
   `references/`.
4. Read referenced files progressively. Do not require loading every reference
   for every invocation.
5. Put repeatable deterministic operations in `scripts/` and document their
   inputs, outputs, platform assumptions, and failure behavior.
6. Keep templates and static resources in `assets/`.
7. Never store API keys, OAuth tokens, personal paths, generated credentials,
   or production data in a skill.
8. A skill describes a workflow. It must not silently broaden permissions or
   make destructive operations implicit.

## Marketplace contract

`.agents/plugins/marketplace.json` is a catalog, not plugin source code. Plugin
source lives under repository-root `plugins/`.

The scaffold intentionally contains an empty `plugins` array. Adding an entry
is an installation/distribution decision and requires a complete plugin plus
explicit review.

When adding a plugin entry:

- Match the marketplace entry `name` to the plugin manifest name.
- Use a `./`-prefixed path such as `./plugins/example-plugin`.
- Keep local paths inside the marketplace/repository root.
- Include `policy.installation`, `policy.authentication`, and `category`.
- Do not use `INSTALLED_BY_DEFAULT` without explicit repository-owner approval.
- Do not commit credentials or authenticated URLs.
- Validate `.codex-plugin/plugin.json` before cataloging the plugin.
- Restart or refresh the relevant Codex/ChatGPT surface after marketplace
  changes when testing discovery.

Example entry, for documentation only:

```json
{
  "name": "example-plugin",
  "source": {
    "source": "local",
    "path": "./plugins/example-plugin"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Developer Tools"
}
```

## Change workflow

Before changing `.agents/`:

1. Decide whether the artifact is a repo skill, plugin catalog entry, or Codex
   project setting.
2. Confirm it is in the correct top-level directory using the boundary map.
3. Search for an existing skill or plugin with the same responsibility.
4. Keep names and descriptions stable after others depend on them.

After changing `.agents/`:

1. Validate JSON syntax for `marketplace.json`.
2. Validate each `SKILL.md` frontmatter and all referenced relative paths.
3. Run each changed script on representative safe input.
4. Confirm no secret or machine-specific absolute path was introduced.
5. Confirm repo-skill and plugin-skill copies have not diverged.

## Definition of done

- The artifact is in `.agents` for discovery, not configuration or plugin
  implementation.
- Every skill has a focused `name`, trigger-oriented `description`, workflow,
  and verification steps.
- Marketplace entries point to valid plugins and use reviewed install policy.
- JSON and referenced paths validate.
- No secret, generated cache, or user-specific state is committed.

## Official documentation basis

- <https://developers.openai.com/codex/codex-manual.md>
- <https://learn.chatgpt.com/docs/build-skills>
- <https://learn.chatgpt.com/docs/build-plugins>
- <https://learn.chatgpt.com/docs/agent-configuration/agents-md>
