# Serena JetBrains operator guide

## Official runtime chain

```text
Codex Desktop
  -> global official Serena MCP
  -> uv tool: serena-agent
  -> 127.0.0.1
  -> IntelliJ IDEA Serena JetBrains Plugin
```

Codex Desktop supervises the MCP subprocess. IntelliJ IDEA owns the paid
JetBrains Plugin. No project launcher, watchdog, proxy, duplicate MCP, or
personal Serena Codex plugin is needed.

The global MCP registration is created by `serena setup codex`:

```toml
[mcp_servers.serena]
startup_timeout_sec = 15
command = "serena"
args = ["start-mcp-server", "--context=codex", "--project-from-cwd"]
```

The project is initialized with `serena init -b JetBrains`. Keep
`D:/GitHub/support` open and indexed in IntelliJ IDEA. The user configuration
keeps `jetbrains_launch_command` empty so background calls do not open a GUI.

## Optional tools

`C:/Users/sup/.serena/serena_config.yml` includes all 23 optional tools exposed
by the installed Serena 1.6.1:

```text
delete_lines
replace_lines
insert_at_line
restart_language_server
get_diagnostics_for_symbol
open_dashboard
remove_project
serena_info
jet_brains_debug
jet_brains_find_declaration
jet_brains_find_implementations
jet_brains_find_referencing_symbols
jet_brains_find_symbol
jet_brains_get_symbols_overview
jet_brains_inline_symbol
jet_brains_list_inspections
jet_brains_move
jet_brains_rename
jet_brains_run_inspections
jet_brains_safe_delete
jet_brains_type_hierarchy
list_queryable_projects
query_project
```

This includes all installed JetBrains BETA operations: debug, inline, move, and
safe delete.

`included_optional_tools` makes optional tools eligible; it does not override
official compatibility filtering:

- the `codex` context removes duplicate basic file and shell tools;
- `editing` mode removes line-based editors in favor of `replace_content`;
- JetBrains mode removes LSP-only restart and generic diagnostic tools.

Keeping the official `codex` context and `interactive` plus `editing` modes is
more stable than switching context merely to expose incompatible duplicates.
Use `serena tools list --all` after every Serena upgrade and refresh the list
when the installed tool inventory changes.

## Effective global settings

| Setting | Value | Purpose |
|---|---|---|
| `language_backend` | `JetBrains` | Uses IDE semantics and safe refactoring. |
| `jetbrains_plugin_server_address` | `127.0.0.1` | Loopback-only plugin connection. |
| `jetbrains_launch_command` | empty | Never opens an IDE GUI automatically. |
| `gui_log_window` | `false` | Keeps MCP background-only. |
| `web_dashboard` | `false` | Avoids an extra service and UI. |
| `tool_timeout` | `60` | Fails fast; broad calls must be narrowed. |
| `included_optional_tools` | all 23 installed optional tools | Enables optional and BETA capabilities when compatible. |
| `excluded_tools` | `[]` | No global manual exclusions. |
| `fixed_tools` | `[]` | Lets official contexts and modes compose tools. |
| `base_modes` | `interactive`, `editing` | Official normal workflow. |
| `token_count_estimator` | `CHAR_COUNT` | Official dependency-free estimator. |

The project adds `no-onboarding` and `query-projects`. Its empty
`activation_command` means the 180-second activation-command backstop does not
run and does not delay startup.

## Codex hooks

The user-level `C:/Users/sup/.codex/hooks.json` calls official commands only:

```text
SessionStart -> serena-hooks activate --client=codex
PreToolUse Bash -> serena-hooks remind --client=codex
Stop -> serena-hooks cleanup --client=codex
```

The project-level `.codex/hooks.json` owns only the repository generated-file
and architecture guard. A fresh trusted task must review changed hook hashes
with `/hooks`.

## Memory and recovery

Use official commands such as `serena memories list`, `serena memories read`,
`serena memories write`, `serena memories edit`, and `serena memories check`.
Keep local task memory untracked and remove stale or contradictory entries.

For recovery:

1. Check `serena --version`, `uv tool list`, and `codex mcp get serena`.
2. Confirm IntelliJ IDEA has the exact repository root open, the paid plugin is
   enabled, and indexing is complete.
3. Confirm the plugin is reachable only through loopback.
4. Start a fresh MCP and run one narrow `jet_brains_*` call.
5. Treat a 60-second timeout as a failure to diagnose, not a reason to restore a
   five-minute timeout.

Official references:

- <https://oraios.github.io/serena/01-about/035_tools.html>
- <https://oraios.github.io/serena/02-usage/025_jetbrains_plugin.html>
- <https://oraios.github.io/serena/02-usage/030_clients.html>
- <https://oraios.github.io/serena/02-usage/050_configuration.html>
