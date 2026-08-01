import type { PostgresMigration } from "@support/database/postgres";

export const postgresAccountMigrations: readonly PostgresMigration[] = [
  {
    id: "identity-accounts-0001",
    sql: `
      create table if not exists support_accounts (
        account_id text primary key,
        username text not null,
        normalized_username text not null unique,
        display_name text not null,
        account_type text not null check (
          account_type in ('personal', 'managed')
        ),
        usage text not null check (
          usage in ('human', 'machine')
        ),
        lifecycle_state text not null check (
          lifecycle_state in ('pending', 'active', 'suspended', 'deleted')
        ),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists support_account_identity_transactions (
        transaction_id text primary key,
        kind text not null check (
          kind in ('registration', 'username-change')
        ),
        state text not null check (
          state in ('prepared', 'committed')
        ),
        account_id text not null,
        pending_username text not null,
        pending_normalized_username text not null unique,
        pending_display_name text not null,
        pending_account_type text not null check (
          pending_account_type in ('personal', 'managed')
        ),
        pending_usage text not null check (
          pending_usage in ('human', 'machine')
        ),
        pending_lifecycle_state text not null check (
          pending_lifecycle_state in (
            'pending', 'active', 'suspended', 'deleted'
          )
        ),
        previous_username text,
        previous_normalized_username text,
        previous_display_name text,
        previous_account_type text check (
          previous_account_type is null or
          previous_account_type in ('personal', 'managed')
        ),
        previous_usage text check (
          previous_usage is null or previous_usage in ('human', 'machine')
        ),
        previous_lifecycle_state text check (
          previous_lifecycle_state is null or
          previous_lifecycle_state in (
            'pending', 'active', 'suspended', 'deleted'
          )
        ),
        created_at timestamptz not null default now(),
        unique (account_id)
      );

      create index if not exists
        support_account_identity_transactions_state_idx
        on support_account_identity_transactions (state, created_at);

      alter table support_accounts enable row level security;
      alter table support_account_identity_transactions
        enable row level security;
    `,
  },
];
