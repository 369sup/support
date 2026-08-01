import type { PostgresMigration } from "@support/database/postgres";

export const postgresAuditStorageMigrations: readonly PostgresMigration[] = [
  {
    id: "202607280010_platform_audit_storage",
    sql: `
      create table if not exists support_audit_records (
        record_id text primary key,
        scope_kind text not null
          check (scope_kind in ('account', 'organization', 'enterprise', 'repository')),
        scope_id text not null,
        actor_id text,
        target_id text,
        occurred_at timestamptz not null,
        record jsonb not null,
        version integer not null check (version = 1)
      );
      create index if not exists support_audit_scope_time_idx
        on support_audit_records
          (scope_kind, scope_id, occurred_at desc, record_id);
      create index if not exists support_audit_actor_idx
        on support_audit_records
          (scope_kind, scope_id, actor_id, occurred_at desc)
        where actor_id is not null;
      create index if not exists support_audit_target_idx
        on support_audit_records
          (scope_kind, scope_id, target_id, occurred_at desc)
        where target_id is not null;

      create table if not exists support_audit_exports (
        export_id text primary key,
        completed_at timestamptz not null,
        export_record jsonb not null,
        version integer not null check (version = 1)
      );

      create table if not exists support_audit_retention_executions (
        execution_id text primary key,
        cutoff timestamptz not null,
        execution_record jsonb not null,
        version integer not null check (version = 1)
      );
    `,
  },
  {
    id: "202607280011_platform_audit_storage_rls",
    sql: `
      alter table support_audit_records enable row level security;
      alter table support_audit_exports enable row level security;
      alter table support_audit_retention_executions
        enable row level security;
    `,
  },
];
