---
name: serena-jetbrains-workflow
description: Use Serena's JetBrains backend for IDE-aware code navigation, symbol analysis, safe refactoring, inspections, or debugging. Apply when a coding task benefits from JetBrains project intelligence or when the user asks to use Serena.
---

# Serena JetBrains Workflow

Use Serena as the semantic code-intelligence layer for the active coding
project. Serena is configured separately as a user-level MCP server; this skill
does not install or launch an additional server.

## Start of a task

1. Call Serena's `initial_instructions` tool before any other Serena tool.
2. Call `get_current_config` and compare the active project with the Codex
   workspace root.
3. If they differ, activate the exact workspace root, then read the current
   configuration again.
4. Verify that the language backend is `JetBrains` and that `jet_brains_*`
   tools are available before relying on semantic results.
5. Confirm that the same project root is open and indexed in the JetBrains IDE.

Do not call Serena onboarding or write memories unless the user explicitly asks
for that persistent state.

## Tool selection

- Prefer Serena symbol, declaration, implementation, reference, hierarchy, and
  dependency search for code structure.
- Prefer Serena rename, move, inline, safe-delete, and symbolic editing for
  semantic refactors.
- Use JetBrains inspections around material code changes when applicable.
- Use the JetBrains debugger only for a reproducible runtime problem that needs
  live state.
- Use ordinary text search and direct editing for prose, configuration,
  generated files, and small non-semantic changes.

## Codex mode and safety

- Codex permissions and collaboration mode remain authoritative. Serena may
  report `editing` mode and expose mutation tools even while Codex is in Plan
  Mode; do not call those mutation tools in Plan Mode.
- Review affected symbols and references before broad refactors.
- Treat a successful semantic refactor as evidence that references were
  updated, but still run the repository's relevant checks for behavior.
- Keep the IDE, Serena, and Codex workspace roots identical.
- Never expose Serena or the JetBrains plugin server beyond localhost without
  explicit user acceptance of the network risk.

## Failure handling

Classify failures before requesting additional authority:

1. **MCP discovery:** If Serena tools are missing, inspect `/mcp verbose`, user
   configuration loading, restart requirements, and new-chat pickup.
2. **Executable:** If Serena is not found, resolve the executable and use its
   absolute path. Do not install or upgrade Serena automatically.
3. **Permission:** For an explicit sandbox denial or `Access is denied`, test
   the exact command, request narrowly scoped elevation, and retry once. Do not
   elevate configuration, backend, root, indexing, or timeout failures.
4. **Backend:** If the backend is not JetBrains, restart the MCP server with the
   correct backend; it cannot be changed in a running server.
5. **IDE connection:** Confirm that the JetBrains plugin is enabled, listening
   on localhost, the IDE is indexed, and the exact project root is open.
6. **Project:** Activate the exact Codex workspace and verify it again.
7. **Stale state:** Keep IDE filesystem synchronization enabled or reload the
   project from disk after external edits.
8. **Timeout:** Confirm both Codex and Serena tool timeouts; permission changes
   do not correct timeouts.

Use Serena's persisted logs under `%USERPROFILE%\.serena\logs` when live MCP
diagnostics are insufficient. The dashboard may remain disabled.

If Serena stays unavailable, state the failed layer and continue with Codex's
built-in tools when that is safe. Never imply that plugin validation proves the
MCP server or JetBrains backend is connected.
