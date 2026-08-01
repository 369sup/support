# Documentation Classification

Documentation is classified on three independent axes: class, authority, and
lifecycle. Combining the axes prevents a navigational page, an active example,
or an old record from being mistaken for a canonical rule.

## Classes

| Value | Purpose |
| --- | --- |
| `entry` | Routes a reader to the smallest relevant document set. |
| `governance` | Defines a normative documentation rule or responsibility boundary. |
| `workflow` | Defines repeatable creation, maintenance, migration, or validation steps. |
| `reference` | Explains terms, examples, questions, or failure patterns. |
| `record` | Preserves accepted decisions, changes, or future intent. |

Choose the class from the document's primary responsibility. A document may
link to material from another class, but it has exactly one registered class.

## Authority

| Value | Meaning |
| --- | --- |
| `canonical` | Owns one explicitly bounded normative concern. |
| `subordinate` | Applies a parent authority to a narrower path or audience. |
| `navigational` | Routes readers and does not decide conflicts. |
| `non-normative` | Illustrates or explains an existing authority. |
| `generated` | Is mechanically projected from an identified input. |

Multiple canonical documents are valid only when their concerns do not
overlap. [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) resolves ownership by
concern, not by filename, detail level, or modification date.

## Lifecycle

| Value | Meaning | Required handling |
| --- | --- | --- |
| `draft` | Proposed and not yet governing. | Mark limitations and do not cite it as an active rule. |
| `active` | Current for its registered responsibility. | Maintain its links, owner, triggers, and validation. |
| `deprecated` | Still resolvable but replaced or scheduled for removal. | Name the replacement and transition condition. |
| `archived` | Retained only for historical evidence. | Remove it from active navigation and state why it remains. |

Deprecation precedes archival when active readers or links need a transition.
Deletion is appropriate only when retention is unnecessary and no valid link or
historical obligation remains.

## Classification rules

- Register all three values in [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md).
- Change lifecycle only through the workflow in
  [`WORKFLOWS.md`](WORKFLOWS.md).
- Do not use product maturity, module implementation status, source freshness,
  or atlas evidence vocabulary as documentation lifecycle values.
- Treat all 21 top-level governance documents as `active` for the initial
  baseline; roadmap items may still describe uncommitted future work.

## Product-semantic confidence

Product evidence uses a separate axis from documentation lifecycle:

| Value | Meaning |
| --- | --- |
| **Confirmed** | Directly stated by a registered GitHub Docs source. |
| **Derived** | The smallest model or target choice that satisfies several confirmed statements. |
| **Unresolved** | Documentation is silent, preview-only, plan-dependent, or insufficient to select one implementation. |

Do not promote repository code, an architectural preference, a familiar GitHub
screen, or a plan-specific behavior to **Confirmed**. A derived model remains
derived even when it is the preferred Support implementation.

## Product capability status

The capability matrix in [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) distinguishes:

| Value | Meaning |
| --- | --- |
| `Active` | Recorded as implemented for the dated Support observation; current source and catalog verification is still required. |
| `Deferred` | Evidence is retained without activating routes, commands, storage, or navigation. |
| `Excluded` | Outside the Support non-code boundary and prohibited from accidental activation. |

Product capability status, module implementation status, source freshness,
evidence confidence, and document lifecycle are independent. Never substitute
one axis for another.
