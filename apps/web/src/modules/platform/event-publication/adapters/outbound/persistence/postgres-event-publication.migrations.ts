import type { PostgresMigration } from "@support/database/postgres";

export const postgresEventPublicationMigrations: readonly PostgresMigration[] =
  [
    {
      id: "202607280001_platform_event_outbox",
      sql: `
        create table if not exists support_event_outbox (
          event_id text primary key,
          source_id text not null,
          occurred_at timestamptz not null,
          envelope jsonb not null,
          state text not null
            check (state in ('pending', 'leased', 'dead-lettered')),
          lease_until timestamptz,
          version integer not null default 1
            check (version > 0)
        );
        create index if not exists support_event_outbox_pending_idx
          on support_event_outbox (source_id, occurred_at, event_id)
          where state = 'pending';
        create index if not exists support_event_outbox_expired_lease_idx
          on support_event_outbox (source_id, lease_until, event_id)
          where state = 'leased';
      `,
    },
    {
      id: "202607280002_platform_event_publication_state",
      sql: `
        create table if not exists support_event_publication_attempts (
          attempt_id text primary key,
          attempted_at timestamptz not null,
          error_code text,
          event_id text not null,
          outcome text not null check (outcome in ('delivered', 'failed')),
          source_context text not null,
          version integer not null check (version = 1)
        );
        create index if not exists support_event_attempt_event_idx
          on support_event_publication_attempts (event_id, attempted_at);
        create table if not exists support_event_publication_receipts (
          event_id text primary key,
          delivered_at timestamptz not null,
          version integer not null check (version = 1)
        );
        create table if not exists support_event_publication_dead_letters (
          dead_letter_id text primary key,
          event_id text not null,
          source_context text not null,
          failed_at timestamptz not null,
          record jsonb not null,
          version integer not null check (version > 0)
        );
        create unique index if not exists support_event_dead_letter_event_idx
          on support_event_publication_dead_letters (event_id);
        create index if not exists support_event_dead_letter_source_idx
          on support_event_publication_dead_letters
            (source_context, failed_at, dead_letter_id);
      `,
    },
  ];
