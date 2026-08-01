-- Desired database state. Do not edit migration history to change it.

-- Historical origin: 202607280010_platform_audit_storage
create table if not exists support_audit_records (
        record_id uuid primary key,
        scope_kind text not null
          check (scope_kind in ('account', 'organization', 'enterprise', 'repository')),
        scope_id uuid not null,
        actor_id uuid,
        target_id uuid,
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
        export_id uuid primary key,
        completed_at timestamptz not null,
        export_record jsonb not null,
        version integer not null check (version = 1)
      );

      create table if not exists support_audit_retention_executions (
        execution_id uuid primary key,
        cutoff timestamptz not null,
        execution_record jsonb not null,
        version integer not null check (version = 1)
      );

-- Historical origin: 202607280011_platform_audit_storage_rls
alter table support_audit_records enable row level security;
      alter table support_audit_exports enable row level security;
      alter table support_audit_retention_executions
        enable row level security;

-- Historical origin: 202607280001_platform_event_outbox
create table if not exists support_event_outbox (
          event_id uuid primary key,
          source_id uuid not null,
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

-- Historical origin: 202607280002_platform_event_publication_state
create table if not exists support_event_publication_attempts (
          attempt_id uuid primary key,
          attempted_at timestamptz not null,
          error_code text,
          event_id uuid not null references support_event_outbox(event_id) on delete cascade,
          outcome text not null check (outcome in ('delivered', 'failed')),
          source_context text not null,
          version integer not null check (version = 1)
        );
        create index if not exists support_event_attempt_event_idx
          on support_event_publication_attempts (event_id, attempted_at);
        create table if not exists support_event_publication_receipts (
          event_id uuid primary key references support_event_outbox(event_id) on delete cascade,
          delivered_at timestamptz not null,
          version integer not null check (version = 1)
        );
        create table if not exists support_event_publication_dead_letters (
          dead_letter_id uuid primary key,
          event_id uuid not null references support_event_outbox(event_id) on delete cascade,
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

-- Historical origin: 202607280003_platform_event_publication_rls
alter table support_event_outbox enable row level security;
        alter table support_event_publication_attempts
          enable row level security;
        alter table support_event_publication_receipts
          enable row level security;
        alter table support_event_publication_dead_letters
          enable row level security;

-- Historical origin: platform-notification-channels-0001
create table if not exists support_channel_deliveries (
          delivery_id uuid primary key,
          idempotency_key text not null unique,
          channel text not null check (channel in ('email')),
          recipient text not null,
          state text not null check (
            state in ('accepted', 'failed', 'succeeded')
          ),
          attempt_count integer not null check (attempt_count > 0),
          provider_reference text,
          failure_code text,
          created_at timestamptz not null,
          updated_at timestamptz not null
        );

        create index if not exists support_channel_deliveries_state_idx
          on support_channel_deliveries (state, updated_at, delivery_id);

-- Historical origin: platform-notification-channels-0002-rls
alter table support_channel_deliveries enable row level security;

-- Historical origin: 202607280020_platform_scheduled_commands
create table if not exists support_scheduled_commands (
          command_id uuid primary key,
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

-- Historical origin: 202607280021_platform_scheduled_commands_rls
alter table support_scheduled_commands enable row level security;

-- Historical origin: platform-media-storage-0001
create table if not exists support_media_objects (
        media_id uuid primary key,
        storage_bucket text not null,
        storage_key text not null,
        byte_length integer not null check (byte_length >= 0),
        checksum text not null,
        classification text not null check (
          classification in ('public', 'private', 'sensitive')
        ),
        content_type text not null,
        state text not null check (
          state in ('active', 'quarantined', 'deleted')
        ),
        version integer not null check (version > 0),
        created_at timestamptz not null,
        deleted_at timestamptz,
        unique (storage_bucket, storage_key)
      );

      create index if not exists support_media_objects_state_idx
        on support_media_objects (state, created_at, media_id);

      create table if not exists support_media_storage_operations (
        operation_id uuid primary key default gen_random_uuid(),
        media_id uuid not null
          references support_media_objects (media_id) on delete cascade,
        operation text not null check (operation in ('remove')),
        storage_bucket text not null,
        storage_key text not null,
        state text not null check (state in ('pending', 'completed')),
        attempts integer not null default 0 check (attempts >= 0),
        created_at timestamptz not null default now(),
        completed_at timestamptz
      );

      create unique index if not exists
        support_media_storage_operations_pending_idx
        on support_media_storage_operations (media_id, operation)
        where state = 'pending';

      alter table support_media_objects enable row level security;
      alter table support_media_storage_operations
        enable row level security;

-- Historical origin: platform-search-index-0001
create table if not exists support_search_documents (
        document_id text primary key,
        kind text not null,
        source_context text not null,
        source_version integer not null check (source_version > 0),
        title text not null,
        body text not null,
        authorization_keys jsonb not null check (
          jsonb_typeof(authorization_keys) = 'array'
        ),
        version integer not null check (version > 0),
        search_vector tsvector generated always as (
          setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(body, '')), 'B')
        ) stored,
        updated_at timestamptz not null default now()
      );

      create index if not exists support_search_documents_vector_idx
        on support_search_documents using gin (search_vector);

      create index if not exists
        support_search_documents_authorization_keys_idx
        on support_search_documents using gin (authorization_keys);

      alter table support_search_documents enable row level security;
