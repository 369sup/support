-- Desired database state. Do not edit migration history to change it.

-- Historical origin: identity-accounts-0001
create table if not exists support_accounts (
        account_id uuid primary key,
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
        transaction_id uuid primary key,
        kind text not null check (
          kind in ('registration', 'username-change')
        ),
        state text not null check (
          state in ('prepared', 'committed')
        ),
        account_id uuid not null,
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

-- Historical origin: identity-account-emails-0001
create table if not exists support_account_emails (
          email_id uuid primary key,
          account_id uuid not null references support_accounts (account_id) on delete cascade,
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
          email_id uuid not null references support_account_emails (
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
            organization_id uuid not null,
            account_id uuid not null,
            email_id uuid not null references support_account_emails (
              email_id
            ) on delete cascade,
            updated_at timestamptz not null,
            primary key (organization_id, account_id)
          );

        create index if not exists support_organization_notification_routes_email_fk_idx
          on support_organization_notification_routes (email_id);

-- Historical origin: identity-account-emails-0002-rls
alter table support_account_emails enable row level security;
        alter table support_released_account_emails
          enable row level security;
        alter table support_email_verifications enable row level security;
        alter table support_organization_notification_routes
          enable row level security;

-- Historical origin: identity-authentication-supabase-0001
create table if not exists support_auth_identities (
        provider text not null check (provider = 'supabase'),
        subject text not null,
        account_id uuid not null references support_accounts(account_id),
        email text not null,
        normalized_email text not null unique,
        email_verified_at timestamptz,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (provider, subject),
        unique (provider, account_id)
      );

      create index if not exists
        support_auth_identities_account_id_idx
        on support_auth_identities (account_id);

      alter table support_auth_identities enable row level security;

-- Historical origin: identity-profiles-0001
create table if not exists support_profiles (
        account_id uuid primary key
          references support_accounts (account_id) on delete cascade,
        display_name text not null,
        bio text not null default '',
        location text not null default '',
        pronouns text not null default '',
        visibility text not null check (
          visibility in ('public', 'private')
        ),
        status jsonb,
        pinned_items jsonb not null default '[]'::jsonb check (
          jsonb_typeof(pinned_items) = 'array'
        ),
        achievements jsonb not null default '[]'::jsonb check (
          jsonb_typeof(achievements) = 'array'
        ),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      alter table support_profiles enable row level security;

-- Historical origin: identity-social-graph-0001
create table if not exists support_user_follows (
        follower_account_id uuid not null
          references support_accounts (account_id) on delete cascade,
        followed_account_id uuid not null
          references support_accounts (account_id) on delete cascade,
        created_at timestamptz not null default now(),
        primary key (follower_account_id, followed_account_id),
        check (follower_account_id <> followed_account_id)
      );

      create index if not exists support_user_follows_followed_idx
        on support_user_follows (followed_account_id, created_at desc);

      alter table support_user_follows enable row level security;
