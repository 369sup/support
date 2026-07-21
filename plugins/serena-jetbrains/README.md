# Serena JetBrains for Codex

This plugin teaches Codex how to use a separately configured Serena MCP server
with Serena's JetBrains language backend. It does not install Serena, bundle an
MCP server, or replace the Serena plugin inside the JetBrains IDE.

```text
Codex host -> user MCP config -> Serena MCP server -> localhost JetBrains plugin -> open IDE project
```

## Supported surfaces

| Surface | Workflow skill | Direct Serena MCP |
| --- | --- | --- |
| ChatGPT desktop app / Codex | Yes, after installing this plugin | Yes |
| Codex CLI | Yes, after installing this plugin | Yes |
| Codex IDE extension | Plugins are not available | Yes, through the shared user Codex config |

Configure Serena as a user-level MCP server so the ChatGPT desktop app, Codex
CLI, and Codex IDE extension use one server definition. Do not also bundle or
configure a second Serena server for the same host.

## Prerequisites

1. Install `uv` using Astral's official instructions.
2. Install and initialize Serena:

   ```powershell
   uv tool install -p 3.13 serena-agent
   serena init -b JetBrains
   ```

3. Install the **Serena** plugin from JetBrains Marketplace in a compatible
   JetBrains IDE. Use the Marketplace page for current IDE compatibility.
4. Open the exact Codex workspace root as the project root in the IDE and wait
   for IDE indexing to finish.

## Codex MCP configuration

Add the server to `~/.codex/config.toml`. On Windows, prefer the absolute path
reported by `Get-Command serena` because a desktop or IDE process may not
inherit recent `PATH` changes.

```toml
[mcp_servers.serena-jetbrains]
command = '<absolute-path-to-serena>'
args = [
  "start-mcp-server",
  "--project-from-cwd",
  "--context=codex",
  "--language-backend",
  "JetBrains",
  "--enable-web-dashboard",
  "false",
  "--open-web-dashboard",
  "false",
]
startup_timeout_sec = 30
tool_timeout_sec = 240
required = false
default_tools_approval_mode = "writes"
```

Restart the relevant Codex surface and start a new chat after changing this
configuration. Use `/mcp verbose` where available to inspect initialization.

## Start of each task

1. Read Serena's initial instructions before calling any other Serena tool.
2. Inspect the current Serena configuration.
3. If the active project does not match the Codex workspace, activate the exact
   workspace root.
4. Verify the active project, `JetBrains` backend, and availability of
   `jet_brains_*` tools before relying on semantic results.

The repository disables automatic Serena onboarding by default. Create or edit
Serena memories only when the user explicitly requests it.

## Troubleshooting

Classify the failure before changing permissions:

| Symptom | Check and correction |
| --- | --- |
| Serena is absent from `/mcp verbose` | Confirm the user config loaded, restart the surface, and start a new chat. |
| Executable not found | Run `Get-Command serena` and use its absolute path in user config. Restart after PATH changes. |
| `Access is denied` or a sandbox denial | Test the exact executable and command. Request narrowly scoped elevation and retry once only when the denial is permission-related. |
| Backend is not JetBrains | Restart the MCP server with the JetBrains backend; a running Serena server cannot switch backends. |
| `jet_brains_*` tools are missing | Confirm the IDE plugin is enabled, the plugin server uses localhost, and the IDE has finished indexing. |
| Active project is wrong | Open and activate the same absolute project root in both the IDE and Serena. |
| IDE results are stale | Keep **Sync file system before every operation** enabled or use **Reload from Disk**. |
| A long inspection or refactor times out | Confirm both Codex `tool_timeout_sec` and Serena's tool timeout allow the operation. Do not elevate. |
| Onboarding asks to write memories | Stop unless the user requested onboarding; use the repository's `no-onboarding` default. |

The dashboard remains disabled by default. Prefer `/mcp verbose`, Serena's
`get_current_config`, and persisted logs under `%USERPROFILE%\.serena\logs`.
Temporarily enable the GUI log window for a diagnostic run only when those
sources do not expose the failure.

Never expose the Serena MCP server, dashboard, or JetBrains plugin server beyond
localhost without an explicit security review.

## Official documentation

- https://learn.chatgpt.com/docs/extend/mcp
- https://learn.chatgpt.com/docs/plugins
- https://oraios.github.io/serena/02-usage/010_installation.html
- https://oraios.github.io/serena/02-usage/025_jetbrains_plugin.html
- https://oraios.github.io/serena/02-usage/030_clients.html
- https://oraios.github.io/serena/02-usage/065_logs.html
