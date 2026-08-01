# Documentation Governance Roadmap

This roadmap communicates possible documentation-governance outcomes. It is
not an accepted decision, delivery commitment, deadline, or representation of
implemented product behavior.

## Now

- Keep the 21-document baseline internally consistent.
- Update the document map, navigation, decisions, and changelog when their
  registered triggers apply.
- Use the explicit validation checklist for documentation-governance changes.

## Next

- Evaluate a dependency-free or already-supported validator for one H1, final
  newline, document-map parity, valid classification values, and resolvable
  local paths.
- Define acceptance fixtures and a stable command before proposing a required
  CI gate.
- Measure recurring maintenance failures before choosing a periodic review
  cadence or stale-document threshold.

Promotion from `Next` requires an owner, bounded inputs and outputs, focused
tests, compatibility with existing architecture automation, and an accepted
decision in [`DECISIONS.md`](DECISIONS.md).

## Later

- Consider machine-readable projections only if repeated manual maintenance
  demonstrates that Markdown tables are insufficient.
- Consider archive discovery and historical indexing when deprecated material
  exists and has a verified retention need.
- Consider broader Markdown style enforcement only when it protects a concrete
  integrity boundary without creating a warning baseline or unnecessary
  dependency.

Items remain candidates until their prerequisites are satisfied. Completed
governance changes move to [`CHANGELOG.md`](CHANGELOG.md); rejected or materially
changed policy choices belong in the decision log.

## Product-semantic gaps

The integrated model preserves these candidates without treating them as active
contracts:

- repository transfer, including retained metadata and assignment
  reconciliation;
- direct collaborator invitations and outside-collaborator workflows;
- repository feature metadata, templates, forks, and releases;
- detailed billing, application integration, sponsorship, security-product,
  and Wiki behavior;
- HTTP status and existence-disclosure contracts for denied resources;
- deny precedence beyond documented enterprise and organization restrictions;
- destructive-state retention and audit details; and
- provider-specific identity, email, search, and audit-export behavior.

Promoting an item requires current official evidence, requirement traceability,
an explicit architecture/catalog owner, active use-case scope, complete
acceptance cases, and the repository's normal activation workflow.
