# Documentation Anti-Patterns

These patterns damage authority, traceability, or maintenance. The corrective
route points to the owning governance contract.

## Competing sources of truth

**Failure:** Copying product, architecture, route, schema, or dependency rules
into a convenient summary and treating both copies as authoritative.

**Correction:** Keep one owner in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) and link to it.

## Hand-editing generated output

**Failure:** Repairing a generated module map or route README without changing
its declared input.

**Correction:** Follow the `generated-from` relationship in
[`DEPENDENCIES.md`](DEPENDENCIES.md), run the owner generator, and inspect the
projection diff.

## Empty or ceremonial documents

**Failure:** Creating a filename without an audience, responsibility, owner,
update trigger, or content.

**Correction:** Satisfy the record in [`SCHEMA.md`](SCHEMA.md) or do not add the
document.

## Inferring implementation from documentation

**Failure:** Treating a README, example, diagram, roadmap item, or dated record
as proof that behavior is active, deployed, durable, or verified.

**Correction:** Check the current owning catalog, source, diagnostics, and test
evidence.

## Mixing current state, history, and intent

**Failure:** Editing historical decisions to match current policy or presenting
roadmap candidates as accepted work.

**Correction:** Keep active contracts, decisions, changelog entries, and roadmap
intent in their separate records.

## Unscoped mass synchronization

**Failure:** Updating every document that mentions a term without checking typed
relationships or ownership.

**Correction:** Follow direct `governed-by` and `depends-on` impact from
[`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) and preserve unrelated content.

## Ambiguous lifecycle

**Failure:** Deleting a still-linked document, calling stale content archived
without a replacement, or using product maturity as documentation lifecycle.

**Correction:** Apply [`WORKFLOWS.md`](WORKFLOWS.md) and the lifecycle values in
[`CLASSIFICATION.md`](CLASSIFICATION.md).

## Non-portable links and examples

**Failure:** Using personal filesystem paths, editor URLs, secrets, customer
data, or commands that do not match repository scripts.

**Correction:** Use repository-relative paths, sanitized illustrative values,
and the checks in [`VALIDATION.md`](VALIDATION.md).

## Promoting inference to product fact

**Failure:** Calling a reconstruction topology, authorization ordering,
transactional outbox, observed UI layout, or Support implementation a confirmed
GitHub behavior.

**Correction:** Trace confirmed claims to a `GH-*` ID in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) and label target choices **Derived**.

## Using unregistered product evidence

**Failure:** Citing repository source, memory, screenshots, search results, or an
unregistered webpage as the authority for GitHub product semantics.

**Correction:** Register and verify an official HTTPS `docs.github.com` source,
then update the affected requirement and models together.

## Collapsing independent states

**Failure:** Combining issue status with conversation lock, notification read
state with triage state, or visibility with authorization into one convenient
enum or check.

**Correction:** Preserve the independent dimensions in
[`WORKFLOWS.md`](WORKFLOWS.md) and apply authorization/state guards separately.

## Treating diagrams as implementation contracts

**Failure:** Inferring physical fields, polymorphic foreign keys, endpoints,
literal URLs, error disclosure, or runtime activation directly from a Mermaid
model.

**Correction:** Use diagrams as research and reconstruction input, then define
the missing contract under the canonical architecture and active catalog.
