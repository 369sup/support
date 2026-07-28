import type { PostgresMigration } from "@support/database/postgres";

export const postgresAccountEmailMigrations: readonly PostgresMigration[] =
  [
    {
      id: "identity-account-emails-0001",
      sql: `
        create table if not exists support_account_emails (
          email_id text primary key,
          account_id text not null,
          address text not null,
          ownership text not null check (
            ownership in ('personal', 'scim')
          ),
          is_primary boolean not null default false,
          is_public boolean not null default false,
          is_verified boolean not null default false,
          created_at timestamptz not null
        );

        create unique index if not exists
          support_account_emails_address_lower_uq
          on support_account_emails (lower(address));
        create unique index if not exists
          support_account_emails_primary_uq
          on support_account_emails (account_id)
          where is_primary;
        create unique index if not exists
          support_account_emails_public_uq
          on support_account_emails (account_id)
          where is_public;
        create index if not exists support_account_emails_account_idx
          on support_account_emails (account_id, created_at, email_id);

        create table if not exists support_released_account_emails (
          address text primary key,
          quarantine_until timestamptz not null,
          released_at timestamptz not null default now()
        );

        create table if not exists support_email_verifications (
          token_hash text primary key,
          email_id text not null references support_account_emails (
            email_id
          ) on delete cascade,
          expires_at timestamptz not null,
          consumed_at timestamptz,
          created_at timestamptz not null default now()
        );

        create index if not exists
          support_email_verifications_email_idx
          on support_email_verifications (email_id, created_at desc);

        create table if not exists
          support_organization_notification_routes (
            organization_id text not null,
            account_id text not null,
            email_id text not null references support_account_emails (
              email_id
            ) on delete cascade,
            updated_at timestamptz not null,
            primary key (organization_id, account_id)
          );
      `,
    },
  ];
