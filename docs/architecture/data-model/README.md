# Database Design Handoff

This directory is the canonical handoff between the
[`github-non-code`](../../github-non-code/README.md) product-semantics atlas,
the active bounded-context catalog in [`../module-map.json`](../module-map.json),
and the desired physical SQL in [`../../../supabase/schemas/`](../../../supabase/schemas/).
It does not own SQL and does not activate a context.

## Authority chain

1. The atlas records official evidence, logical entities, lifecycles,
   authorization inputs, and observable side effects.
2. [`active-model.md`](active-model.md) resolves every active context to concrete
   schemas, relations, consumers, lifecycle encoding, security, retention, and
   transaction effects.
3. [`planned-model.md`](planned-model.md) records migration-ready design work
   that is prohibited from producing SQL while its catalog status is planned.
4. [`../../../supabase/schemas/`](../../../supabase/schemas/) defines the desired
   physical state. Exact columns, types, nullability, defaults, keys, checks,
   referential actions, and indexes live only there.
5. [`../../../supabase/migrations/`](../../../supabase/migrations/) records
   immutable forward history generated from that state or an explicit
   documented diff exception.

If a required decision is unresolved, the physical disposition is `blocked` and
no SQL object may be emitted. A diagram is a traceable projection of these
records, never a separate authority.

## Fixed physical conventions

- Each bounded context owns one `support_<subdomain>_<context>` schema. Every
  application query uses a schema-qualified object name.
- New internal identifiers are UUID. External provider subjects, source IDs,
  and protocol identifiers remain text. Existing text identifiers are a
  compatibility debt and may not spread to new relations.
- Instants are `timestamptz`. State is text plus a named `CHECK`; PostgreSQL
  enums are not used.
- `jsonb` is limited to open payloads, snapshots, projections, and metadata
  whose shape is separately validated. It does not replace a known relation.
- Generic owner, subject, or target columns require a closed discriminator with
  a corresponding `CHECK` and explicit application validation. New generic
  foreign keys are blocked until they can use concrete references or
  resource-specific association tables.
- Projections are rebuildable and never authorize a command. An outbox row is
  inserted in the same transaction as the owning domain mutation.
- Product objects grant no access to `PUBLIC`, `anon`, `authenticated`, or
  `service_role`. `support_web_runtime` is the only application role, with
  forced RLS as defense in depth.
- `SECURITY DEFINER` functions live only in `support_private`, use
  `set search_path = ''`, revoke PUBLIC execution, and document their caller.

## Required change workflow

1. Resolve source IDs, context ownership, physical disposition, data
   classification, retention, commands, queries, indexes, and transaction
   effects here.
2. Update the declarative SQL and every affected diagram in
   [`diagrams.md`](diagrams.md).
3. Render each changed Mermaid block with Mermaid Chart.
4. Generate a forward migration with `supabase db diff -f <change>`. For a
   documented CLI caveat, use `supabase migration new` and register the reason
   in [`migration-exceptions.md`](migration-exceptions.md).
5. Review destructive statements and privilege changes, rebuild an empty local
   database, and require a subsequent diff to be empty.
6. Run [`../../../scripts/check-database-contract.mjs`](../../../scripts/check-database-contract.mjs)
   so deployed objects cannot belong to planned contexts.

Remote reset procedure and the exact confirmation requirement are in
[`../../../supabase/README.md`](../../../supabase/README.md).
