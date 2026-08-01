# Documentation Schema

This schema defines logical records for the documentation governance system.
It is represented in Markdown tables and sections; version 1 does not require
YAML front matter or change any application, API, event, or database schema.

## Document record

[`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) contains one record for every top-level
governance document.

| Field | Cardinality | Contract |
| --- | --- | --- |
| `path` | Required, unique | Repository-relative Markdown path. |
| `title` | Required | Exact H1 text. |
| `class` | Required | One class from [`CLASSIFICATION.md`](CLASSIFICATION.md). |
| `authority` | Required | One authority value from `CLASSIFICATION.md`. |
| `lifecycle` | Required | One lifecycle value from `CLASSIFICATION.md`. |
| `owner` | Required | Role or repository boundary responsible for correctness. |
| `audience` | Required | Primary reader group. |
| `update trigger` | Required | Observable event that requires review. |
| `dependencies` | Zero or more | Typed relationships defined by [`DEPENDENCIES.md`](DEPENDENCIES.md). |
| `validation` | Required | Smallest check that demonstrates structural integrity. |

Paths and titles identify a document; they do not grant authority. Authority is
assigned by its registered concern in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md).

## Decision record

Each entry in [`DECISIONS.md`](DECISIONS.md) contains:

| Field | Required | Contract |
| --- | --- | --- |
| `id` | Yes | Stable `DOC-DEC-NNN` identifier. |
| `status` | Yes | `Proposed`, `Accepted`, or `Superseded`. |
| `date` | Yes | ISO `YYYY-MM-DD` decision date. |
| `decision` | Yes | The selected documentation-governance rule. |
| `rationale` | Yes | Evidence or constraint that made the choice appropriate. |
| `consequences` | Yes | Operational and maintenance effects. |
| `supersedes` | When applicable | Identifier of the replaced decision. |

Decision records are append-preserving. Correct typographical errors in place,
but supersede a changed decision rather than rewriting its historical meaning.

## Changelog entry

Each dated section in [`CHANGELOG.md`](CHANGELOG.md) uses an ISO date and only
the applicable `Added`, `Changed`, `Deprecated`, or `Removed` groups. Entries
describe documentation-governance changes, not product releases or source-code
behavior.

## Roadmap entry

[`ROADMAP.md`](ROADMAP.md) groups items under `Now`, `Next`, or `Later`. An item
states the intended outcome, prerequisite, and evidence needed to promote it.
Roadmap placement is not an accepted decision, deadline, or implementation
claim.

## Conformance

A record conforms when all required fields are present, values use the canonical
vocabulary, local paths resolve, and no two records assign the same concern to
different canonical owners. Validation is defined in
[`VALIDATION.md`](VALIDATION.md).

Product concepts and evidence IDs are outside this governance-record schema.
They remain in the [`github-non-code`](github-non-code/README.md) atlas; resolved
database design remains in [`architecture/data-model/`](architecture/data-model/README.md).
