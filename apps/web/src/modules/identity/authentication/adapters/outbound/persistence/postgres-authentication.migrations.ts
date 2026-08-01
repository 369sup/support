import type { PostgresMigration } from "@support/database/postgres";

export const postgresAuthenticationMigrations: readonly PostgresMigration[] = [
  {
    id: "identity-authentication-0001",
    sql: `
      create table if not exists support_password_credentials (
        account_id text primary key,
        username text not null,
        verifier_salt text not null,
        verifier_digest text not null,
        is_locked boolean not null default false,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create unique index if not exists
        support_password_credentials_username_lower_uq
        on support_password_credentials (lower(username));

      create table if not exists support_password_credential_transactions (
        transaction_id text primary key,
        action text not null check (
          action in ('registration', 'username-change')
        ),
        account_id text not null,
        requested_username text not null,
        previous_username text,
        state text not null check (
          state in ('prepared', 'committed')
        ),
        created_at timestamptz not null default now()
      );

      create index if not exists
        support_password_credential_transactions_account_idx
        on support_password_credential_transactions (account_id, created_at);

      create table if not exists support_authentication_attempts (
        attempt_id bigserial primary key,
        normalized_username text not null,
        attempted_at timestamptz not null default now(),
        was_successful boolean not null
      );

      create index if not exists
        support_authentication_attempts_window_idx
        on support_authentication_attempts (
          normalized_username, attempted_at desc
        );

      create table if not exists support_browser_session_sets (
        token_hash text primary key,
        active_session_id text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create table if not exists support_account_sessions (
        session_id text primary key,
        token_hash text not null references support_browser_session_sets (
          token_hash
        ) on delete cascade,
        account_id text not null,
        status text not null check (
          status in ('active', 'expired', 'revoked')
        ),
        authenticated_at timestamptz not null,
        expires_at timestamptz,
        last_active_at timestamptz not null,
        created_at timestamptz not null default now()
      );

      create index if not exists support_account_sessions_token_idx
        on support_account_sessions (token_hash, session_id);
      create index if not exists support_account_sessions_account_idx
        on support_account_sessions (account_id, status, last_active_at desc);

      create table if not exists support_password_reset_tokens (
        token_hash text primary key,
        account_id text not null,
        expires_at timestamptz not null,
        consumed_at timestamptz,
        created_at timestamptz not null default now()
      );

      create index if not exists support_password_reset_tokens_account_idx
        on support_password_reset_tokens (account_id, created_at desc);

      create table if not exists support_password_history (
        history_id bigserial primary key,
        account_id text not null,
        verifier_salt text not null,
        verifier_digest text not null,
        created_at timestamptz not null default now()
      );

      create index if not exists support_password_history_account_idx
        on support_password_history (account_id, created_at desc);

      create table if not exists support_two_factor_configurations (
        account_id text primary key,
        totp_secret text,
        pending_totp_secret text,
        is_enabled boolean not null default false,
        last_totp_counter bigint,
        sudo_until timestamptz,
        updated_at timestamptz not null default now()
      );

      create table if not exists support_recovery_codes (
        account_id text not null,
        code_hash text not null,
        consumed_at timestamptz,
        created_at timestamptz not null default now(),
        primary key (account_id, code_hash)
      );

      create table if not exists support_passkeys (
        credential_id text primary key,
        account_id text not null,
        public_key bytea not null,
        webauthn_user_id text not null,
        counter bigint not null,
        device_type text not null,
        is_backed_up boolean not null,
        transports text[] not null default '{}',
        created_at timestamptz not null default now(),
        last_used_at timestamptz
      );

      create index if not exists support_passkeys_account_idx
        on support_passkeys (account_id, created_at);

      create table if not exists support_authentication_challenges (
        challenge_id text primary key,
        account_id text not null,
        kind text not null check (
          kind in ('passkey-registration', 'passkey-authentication')
        ),
        challenge text not null,
        expires_at timestamptz not null,
        consumed_at timestamptz,
        created_at timestamptz not null default now()
      );

      create index if not exists
        support_authentication_challenges_account_idx
        on support_authentication_challenges (
          account_id, kind, created_at desc
        );

      create table if not exists support_two_factor_recovery_requests (
        request_id text primary key,
        account_id text not null,
        requested_at timestamptz not null,
        available_at timestamptz not null,
        completed_at timestamptz,
        cancelled_at timestamptz
      );

      create index if not exists
        support_two_factor_recovery_requests_account_idx
        on support_two_factor_recovery_requests (
          account_id, requested_at desc
        );
    `,
  },
  {
    id: "identity-authentication-0002-rls",
    sql: `
      alter table support_password_credentials enable row level security;
      alter table support_password_credential_transactions
        enable row level security;
      alter table support_authentication_attempts enable row level security;
      alter table support_browser_session_sets enable row level security;
      alter table support_account_sessions enable row level security;
      alter table support_password_reset_tokens enable row level security;
      alter table support_password_history enable row level security;
      alter table support_two_factor_configurations
        enable row level security;
      alter table support_recovery_codes enable row level security;
      alter table support_passkeys enable row level security;
      alter table support_authentication_challenges
        enable row level security;
      alter table support_two_factor_recovery_requests
        enable row level security;
    `,
  },
];
