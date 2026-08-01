# Plugin Source Contract

This file governs `plugins/` and every plugin package below it.

Artifact placement is defined once in the repository-root
[`AGENTS.md`](../AGENTS.md). This file applies after `plugins` has been selected
for an installable Codex/ChatGPT distribution unit that can bundle skills and
optional hooks, MCP configuration, app mappings, and assets.

A plugin directory is not installed merely because it exists here. Cataloging
and installation remain separate reviewed actions.

## Canonical plugin structure

```text
plugins/
├── AGENTS.md
├── plugin-template/                    # inert uncataloged starting point
│   ├── AGENTS.md
│   ├── .codex-plugin/
│   │   └── plugin.json                 # required plugin manifest
│   ├── skills/
│   │   └── example-workflow/
│   │       ├── SKILL.md                # required per bundled skill
│   │       ├── agents/
│   │       │   └── openai.yaml         # optional skill UI/dependency metadata
│   │       ├── scripts/                # optional skill helpers
│   │       ├── references/             # optional progressive docs
│   │       └── assets/                 # optional skill resources
│   ├── hooks/
│   │   └── hooks.json                  # optional lifecycle hooks
│   ├── assets/                         # optional plugin-level presentation assets
│   ├── .mcp.json                       # optional MCP server configuration
│   └── .app.json                       # optional app/connector mapping
└── <plugin-name>/                       # future real plugin; kebab-case
    └── ...same package shape...
```

Only `plugin.json` belongs inside `.codex-plugin/`. Keep `skills`, `hooks`,
`assets`, `.mcp.json`, and `.app.json` at the plugin root.

## Manifest contract

Every real plugin requires `.codex-plugin/plugin.json`.

Minimum fields for this repository:

```json
{
  "name": "example-plugin",
  "version": "0.1.0",
  "description": "Explain the capability and intended users.",
  "skills": "./skills/"
}
```

Rules:

1. Use a stable lowercase kebab-case `name` and match the package folder.
2. Use semantic versions and update the version for distributable behavior
   changes.
3. Point only to components that exist.
4. Use plugin-root-relative `./` paths.
5. Keep install-facing description and interface metadata accurate.
6. Do not invent manifest fields. Verify current official schema before adding
   optional metadata.
7. Do not reference files outside the plugin package.
8. Do not add the template itself to the marketplace.

## Bundled skill contract

The generic skill contract is defined once in
[`.agents/AGENTS.md`](../.agents/AGENTS.md). Plugin-bundled skills add only
these distribution-specific requirements:

- A plugin skill is namespaced by the plugin at distribution time; still choose
  a clear stable skill name.
- Declare optional UI metadata and tool dependencies in
  `agents/openai.yaml` only when needed.
- Never depend on files outside the installed plugin package.

## Optional capability boundaries

| File/directory | Add only when |
| --- | --- |
| `hooks/hooks.json` | The plugin must enforce a reviewed lifecycle behavior |
| `.mcp.json` | The plugin needs MCP tools/resources/prompts |
| `.app.json` | The plugin maps to an authorized ChatGPT app/connector |
| `assets/` | Install UI or plugin components reference real assets |
| `agents/openai.yaml` | A skill needs UI metadata, invocation policy, or tool dependencies |

Omission is preferred to an empty or fake integration. Never place credentials
in `.mcp.json` or `.app.json`; use documented authentication mechanisms and
environment/config references.

## Hooks and MCP safety

- Hooks execute during lifecycle events. Keep matchers and commands narrow,
  deterministic, time-bounded, and safe for untrusted payloads.
- MCP configuration grants tools or data access. Document each server's purpose,
  trust boundary, required authentication, read/write capability, and failure
  mode.
- Adding a hook, writable connector, or MCP server materially changes plugin
  authority and requires explicit security review.
- A skill instruction cannot grant permissions that the installed environment
  has not authorized.

## Marketplace publication workflow

Do not edit `.agents/plugins/marketplace.json` until the package is complete.

Publication sequence:

1. Copy `plugin-template` to `plugins/<plugin-name>`.
2. Replace template names, descriptions, and example instructions.
3. Remove unused optional directories and references.
4. Validate `plugin.json`, every `SKILL.md`, hooks, MCP/app mappings, and paths.
5. Run bundled scripts and exercise each skill with matching and non-matching
   prompts.
6. Review permissions, authentication, privacy, terms, and user-facing metadata.
7. Hand off cataloging to the authoritative marketplace workflow in
   [`.agents/AGENTS.md`](../.agents/AGENTS.md).
8. Restart/refresh the relevant surface and install from the local marketplace.
9. Test the installed cached copy, not only the source directory.

## Change workflow

Before changing a plugin:

1. Read the plugin's own `AGENTS.md` and manifest.
2. Identify whether the change affects discovery, runtime authority, prompts,
   external data, or install metadata.
3. Confirm paths stay inside the package.
4. Preserve stable public names unless a breaking change is intentional.

After changing a plugin:

1. Parse every JSON/YAML/TOML file.
2. Resolve every manifest and skill-relative path.
3. Validate skill frontmatter and progressive-disclosure references.
4. Test scripts, hooks, MCP tools, and apps in proportion to their authority.
5. Check for secrets and generated cache files.
6. Reinstall or refresh the plugin before final verification.

## Definition of done

- `.codex-plugin/plugin.json` is present and valid.
- Only the manifest exists inside `.codex-plugin/`.
- Every bundled skill is focused, self-contained, and verifiable.
- Optional hooks/MCP/apps are documented and security-reviewed.
- Marketplace metadata matches the package and install policy.
- The installed plugin behaves as tested and contains no secret state.

## Official documentation basis

- <https://developers.openai.com/codex/codex-manual.md>
- <https://learn.chatgpt.com/docs/build-plugins>
- <https://learn.chatgpt.com/docs/build-skills>
- <https://github.com/openai/plugins>
