import type { PostgresMigration } from "@support/database/postgres";

export const postgresScheduledCommandMigrations: readonly PostgresMigration[] =
  [
    {
      id: "202607280020_platform_scheduled_commands",
      sql: `
        create table if not exists support_scheduled_commands (
          command_id text primary key,
          owner_context text not null,
          command_name text not null,
          payload jsonb not null,
          due_at timestamptz not null,
          state text not null
            check (state in ('pending', 'leased', 'completed', 'dead-lettered')),
          attempt_count integer not null default 0
            check (attempt_count >= 0),
          max_attempts integer not null
            check (max_attempts between 1 and 100),
          worker_id text,
          lease_until timestamptz,
          last_error_code text,
          version integer not null default 1
            check (version > 0)
        );
        create index if not exists support_scheduled_commands_due_idx
          on support_scheduled_commands (due_at, command_id)
          where state = 'pending';
        create index if not exists support_scheduled_commands_lease_idx
          on support_scheduled_commands (lease_until, command_id)
          where state = 'leased';
      `,
    },
    {
      id: "202607280021_platform_scheduled_commands_rls",
      sql: `
        alter table support_scheduled_commands enable row level security;
      `,
    },
  ];
