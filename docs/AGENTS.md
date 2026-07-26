# Documentation Workflow

This file governs `docs/**`. Architecture documentation has more specific
change control in [`architecture/AGENTS.md`](architecture/AGENTS.md).

## Documentation rules

- Name the audience, authority, and verification path.
- Link to the authoritative rule instead of copying it.
- Keep examples consistent with current architecture and mark illustrative
  paths or values clearly.
- Record accepted decisions and tradeoffs without inventing status or silently
  rewriting historical rationale.
- Keep developer commands cross-platform and aligned with package scripts.
- Update documentation in the same change when public behavior,
  configuration, architecture, or operator workflow changes.
- Do not include secrets, personal paths, customer data, or screenshots with
  personal information.

Run the owner generator for generated documents; never edit generated output
directly. Check referenced paths, local links, commands, and package names.
Execute documented commands when practical and report unexecuted examples as
unverified.
