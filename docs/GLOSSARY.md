# Documentation Glossary

This glossary defines documentation-governance terms. Product and technical
terms remain with their owning architecture, catalog, or product-semantics
sources.

| Term | Meaning |
| --- | --- |
| Active | The lifecycle of a document currently governing or serving its registered responsibility. |
| Archived | Historical documentation removed from active navigation and retained for an explicit reason. |
| Authority | The role a document has when resolving a concern: canonical, subordinate, navigational, non-normative, or generated. |
| Canonical | The single owner of one explicitly bounded normative concern. |
| Class | A document's primary purpose: entry, governance, workflow, reference, or record. |
| Confirmed | A product-semantic claim directly stated by a registered GitHub Docs source. |
| Deprecated | A resolvable document with a named replacement or removal transition. |
| Derived | The smallest product model or target choice satisfying confirmed statements; not a claim about GitHub internals. |
| Document map | The authoritative registry of the 21 top-level governance documents and their metadata. |
| Draft | Proposed documentation that is not yet active authority. |
| Generated | Mechanically projected documentation whose declared input must be changed instead of the projection. |
| Governance contract | A document that owns a bounded rule about documentation authority, structure, vocabulary, or lifecycle. |
| Lifecycle | The independent document state: draft, active, deprecated, or archived. |
| Non-normative | Material that explains or illustrates an authority but cannot override it. |
| Owner | The role or repository boundary accountable for a document's correctness. |
| Record | A document preserving accepted decisions, delivered changes, or future intent. |
| Source of truth | The identified owner that resolves one concern; not a claim that one file owns every concern. |
| Subordinate | Path- or audience-specific guidance that applies a parent authority without weakening or broadening it. |
| Unresolved | A product-semantic question for which evidence is silent, preview-only, plan-dependent, or insufficient. |
| Update trigger | An observable change that requires a document to be reviewed. |
| Validation path | The smallest check or evidence set that demonstrates the document remains structurally coherent. |

The product-semantic evidence terms **Confirmed**, **Derived**, and
**Unresolved** are governed by [`CLASSIFICATION.md`](CLASSIFICATION.md) and are
not general documentation lifecycle or module implementation values.

Product concepts such as Personal Account, Enterprise, Organization, Team,
Repository, Issue, Discussion, Project, Subscription, Notification, Moderation
Action, and Audit Event are defined by the conceptual model in
[`SCHEMA.md`](SCHEMA.md). Their implementation types remain with active source
contracts.
