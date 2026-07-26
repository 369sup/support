# Plugin Template Instructions

This directory is an uncataloged authoring template. Do not publish or add it
to `.agents/plugins/marketplace.json` as `plugin-template`.

To create a real plugin:

1. Copy this entire directory to `plugins/<plugin-name>`.
2. Use lowercase kebab-case for the directory and manifest `name`.
3. Replace every template name, description, and example workflow.
4. Add only the optional hooks, MCP/app mappings, and assets actually needed.
5. Keep only `plugin.json` inside `.codex-plugin/`.
6. Validate and test the complete package before adding a marketplace entry.

Follow the parent [Plugin Source Contract](../AGENTS.md). Never commit secrets,
tokens, customer data, or machine-specific paths.
