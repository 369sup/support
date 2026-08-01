# Documentation Maintenance

Documentation maintenance is event-driven. This baseline does not claim a
scheduled audit, named individual owner, or automated freshness service that the
repository does not currently have.

## Ownership

The owner registered in [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) is responsible for
semantic accuracy. Repository maintainers are responsible for navigation,
structure, and lifecycle consistency. Generated-document owners remain defined
by their generators and existing architecture guidance.

Ownership is a role or repository boundary, not a personal filesystem path or
an undocumented individual assignment.

## Review triggers

| Trigger | Required review |
| --- | --- |
| A public interface, environment variable, deployment process, runbook, or operator workflow changes | Review the documentation named by the owning implementation or contract. |
| A canonical authority changes | Review incoming `governed-by` and `depends-on` relationships. |
| A document moves or changes title | Update the document map, index, navigation, and all valid local links. |
| A governance vocabulary or schema changes | Add a decision record and migrate affected document-map records. |
| A generated input changes | Regenerate and inspect its declared projections. |
| A referenced external source is preview, plan-dependent, or plausibly stale | Reverify it under the source owner's rules before relying on the claim. |
| A document no longer describes current responsibility | Correct it, deprecate it, or record an unresolved ownership gap. |

## Health review

When a documentation health review is requested, check:

- registered paths, titles, classification, lifecycle, and owners;
- canonical concerns with competing definitions;
- empty documents, broken local links, and invalid generated edits;
- active navigation that points to deprecated or archived material;
- current-state claims without evidence and roadmap items presented as delivery;
- commands, package names, and repository paths that no longer exist; and
- changelog or decision records missing for material governance changes.

Use [`VALIDATION.md`](VALIDATION.md) for the executable baseline. A future
periodic cadence or automated stale-document gate must be accepted as a separate
decision with an owner and measurable signal before this document claims it is
operational.

## Repair policy

Make the smallest correction at the owning source. Preserve historical meaning,
unrelated user work, and generated boundaries. If the correct owner cannot be
identified, record the gap instead of assigning authority by convenience.

## Product evidence maintenance

The official GitHub source register in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) owns product evidence. Reverify an
affected source when it is preview, plan-dependent, account-dependent,
deployment-dependent, unavailable, materially changed, or plausibly stale.

When evidence changes:

1. keep the source ID stable unless the source concern itself is replaced;
2. update its supported-semantics statement and recorded verification date;
3. review incoming requirement and model references;
4. downgrade affected claims to **Unresolved** when evidence is no longer
   sufficient;
5. update prose, diagrams, acceptance focus, and capability status together;
   and
6. run the product-semantic checks in [`VALIDATION.md`](VALIDATION.md).

Do not refresh a date merely because content moved. The 2026-07-29 and
2026-07-30 dates preserved in this migration remain historical verification
evidence until the external pages are actually reviewed again.
