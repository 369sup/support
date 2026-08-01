begin;

create table if not exists public.support_schema_migrations (
  migration_id text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);
alter table public.support_schema_migrations enable row level security;

-- Support migration: identity-authentication-supabase-0002
create or replace function support_private.provision_supabase_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_account_id text := gen_random_uuid()::text;
        support_email_id text := gen_random_uuid()::text;
        support_username text := btrim(
          coalesce(new.raw_user_meta_data ->> 'username', '')
        );
        support_email text := btrim(coalesce(new.email, ''));
      begin
        if support_username !~ '^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?$' then
          return new;
        end if;

        if exists (
          select 1
          from public.support_auth_identities
          where provider = 'supabase'
            and subject = new.id::text
        ) then
          return new;
        end if;

        if support_email = '' then
          raise exception using
            errcode = 'not_null_violation',
            message = 'Supabase account email is required.';
        end if;

        insert into public.support_accounts (
          account_id,
          username,
          normalized_username,
          display_name,
          account_type,
          usage,
          lifecycle_state
        ) values (
          support_account_id,
          support_username,
          lower(support_username),
          support_username,
          'personal',
          'human',
          'active'
        );

        insert into public.support_auth_identities (
          provider,
          subject,
          account_id,
          email,
          normalized_email,
          email_verified_at
        ) values (
          'supabase',
          new.id::text,
          support_account_id,
          support_email,
          lower(support_email),
          new.email_confirmed_at
        );

        insert into public.support_account_emails (
          email_id,
          account_id,
          address,
          ownership,
          is_primary,
          is_public,
          is_verified,
          created_at
        ) values (
          support_email_id,
          support_account_id,
          support_email,
          'personal',
          true,
          false,
          new.email_confirmed_at is not null,
          now()
        );

        return new;
      end;
      $$;

      revoke all on function
        support_private.provision_supabase_user()
        from public;
      revoke all on function
        support_private.provision_supabase_user()
        from anon;
      revoke all on function
        support_private.provision_supabase_user()
        from authenticated;

      create or replace function support_private.sync_supabase_user_email()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_email text := btrim(coalesce(new.email, ''));
        support_account_id text;
      begin
        if support_email = '' then
          raise exception using
            errcode = 'not_null_violation',
            message = 'Supabase account email is required.';
        end if;

        update public.support_auth_identities
        set
          email = support_email,
          normalized_email = lower(support_email),
          email_verified_at = new.email_confirmed_at,
          updated_at = now()
        where provider = 'supabase'
          and subject = new.id::text
        returning account_id into support_account_id;

        if support_account_id is null then
          return new;
        end if;

        update public.support_account_emails
        set
          address = support_email,
          is_verified = new.email_confirmed_at is not null
        where account_id = support_account_id
          and is_primary;

        return new;
      end;
      $$;

      revoke all on function
        support_private.sync_supabase_user_email()
        from public;
      revoke all on function
        support_private.sync_supabase_user_email()
        from anon;
      revoke all on function
        support_private.sync_supabase_user_email()
        from authenticated;

      drop trigger if exists
        support_on_auth_user_profile_completed
        on auth.users;
      create trigger support_on_auth_user_profile_completed
        after update of raw_user_meta_data on auth.users
        for each row
        when (
          old.raw_user_meta_data ->> 'username'
          is distinct from
          new.raw_user_meta_data ->> 'username'
        )
        execute function support_private.provision_supabase_user();

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-authentication-supabase-0002', '7abaa8b48957b19aef046b19734ca086916bcb1e0349bbd65f7e92de1d6d43c5')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: identity-profiles-0001
create table if not exists support_profiles (
        account_id text primary key
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

      insert into support_profiles (
        account_id,
        display_name,
        visibility
      )
      select
        account_id,
        display_name,
        'public'
      from support_accounts
      where account_type = 'personal'
        and usage = 'human'
        and lifecycle_state <> 'deleted'
      on conflict (account_id) do nothing;

      alter table support_profiles enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-profiles-0001', '434e1966f5b8d341a35b58553c2f59106f3e948ba94e04d727a0100f0c614339')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: identity-social-graph-0001
create table if not exists support_user_follows (
        follower_account_id text not null
          references support_accounts (account_id) on delete cascade,
        followed_account_id text not null
          references support_accounts (account_id) on delete cascade,
        created_at timestamptz not null default now(),
        primary key (follower_account_id, followed_account_id),
        check (follower_account_id <> followed_account_id)
      );

      create index if not exists support_user_follows_followed_idx
        on support_user_follows (followed_account_id, created_at desc);

      alter table support_user_follows enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-social-graph-0001', '1d8a38631a8d1fbe352985eff74f76185bee93d04ea8c5957a8d52dbe245fb46')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: collaboration-conversations-0001
create table if not exists support_conversation_subjects (
        subject_kind text not null check (
          subject_kind in ('issue', 'discussion')
        ),
        subject_id text not null,
        is_locked boolean not null default false,
        updated_at timestamptz not null default now(),
        primary key (subject_kind, subject_id)
      );

      create table if not exists support_conversation_comments (
        comment_id text primary key,
        subject_kind text not null check (
          subject_kind in ('issue', 'discussion')
        ),
        subject_id text not null,
        author_account_id text not null
          references support_accounts (account_id) on delete cascade,
        author_username text not null,
        body text not null,
        created_at timestamptz not null,
        thumbs_up_count integer not null default 0 check (
          thumbs_up_count >= 0
        ),
        heart_count integer not null default 0 check (heart_count >= 0),
        hooray_count integer not null default 0 check (hooray_count >= 0),
        eyes_count integer not null default 0 check (eyes_count >= 0)
      );

      create index if not exists
        support_conversation_comments_subject_idx
        on support_conversation_comments (
          subject_kind,
          subject_id,
          created_at,
          comment_id
        );

      create table if not exists support_conversation_reactions (
        comment_id text not null
          references support_conversation_comments (comment_id)
          on delete cascade,
        actor_account_id text not null
          references support_accounts (account_id) on delete cascade,
        reaction text not null check (
          reaction in ('thumbs-up', 'heart', 'hooray', 'eyes')
        ),
        created_at timestamptz not null default now(),
        primary key (comment_id, actor_account_id, reaction)
      );

      create index if not exists
        support_conversation_reactions_actor_idx
        on support_conversation_reactions (actor_account_id, created_at desc);

      alter table support_conversation_subjects enable row level security;
      alter table support_conversation_comments enable row level security;
      alter table support_conversation_reactions enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('collaboration-conversations-0001', '2516d7bba6c434e6df97603d28ca45537ed791fe947fe73c188f31f450d90817')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: collaboration-discussions-0001
create table if not exists support_repository_discussion_counters (
        repository_id text primary key
          references support_repositories (repository_id) on delete cascade,
        next_number integer not null check (next_number > 0)
      );

      create table if not exists support_repository_discussions (
        discussion_id text primary key,
        repository_id text not null
          references support_repositories (repository_id) on delete cascade,
        number integer not null check (number > 0),
        title text not null,
        body text not null,
        category text not null check (
          category in ('announcements', 'general', 'q-and-a')
        ),
        state text not null check (state in ('open', 'closed')),
        author_account_id text not null
          references support_accounts (account_id) on delete cascade,
        author_username text not null,
        created_at timestamptz not null,
        updated_at timestamptz not null,
        unique (repository_id, number)
      );

      create index if not exists support_repository_discussions_list_idx
        on support_repository_discussions (
          repository_id,
          updated_at desc,
          number desc
        );

      alter table support_repository_discussion_counters
        enable row level security;
      alter table support_repository_discussions enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('collaboration-discussions-0001', 'cd27dbc840356780e6be0da6d18c0d668d5f6a86502f4c75cda6bd5a9ac002ec')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: collaboration-issues-0001
create table if not exists support_repository_issue_counters (
        repository_id text primary key
          references support_repositories (repository_id) on delete cascade,
        next_number integer not null check (next_number > 0)
      );

      create table if not exists support_repository_issues (
        issue_id text primary key,
        repository_id text not null
          references support_repositories (repository_id) on delete cascade,
        number integer not null check (number > 0),
        title text not null,
        body text not null,
        state text not null check (state in ('open', 'closed')),
        author_account_id text not null
          references support_accounts (account_id) on delete cascade,
        author_username text not null,
        created_at timestamptz not null,
        updated_at timestamptz not null,
        unique (repository_id, number)
      );

      create index if not exists support_repository_issues_list_idx
        on support_repository_issues (
          repository_id,
          state,
          updated_at desc,
          number desc
        );

      alter table support_repository_issue_counters
        enable row level security;
      alter table support_repository_issues enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('collaboration-issues-0001', '98af9cc0ab3c7ffc96daa4c99cfd5373ee3b1493e7ccb53dcbe59ebd0c35e2c1')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: collaboration-moderation-0001
create table if not exists support_content_reports (
        report_id text primary key,
        reporter_account_id text not null
          references support_accounts (account_id) on delete cascade,
        target_kind text not null check (
          target_kind in ('issue', 'comment')
        ),
        target_id text not null,
        reason text not null check (
          reason in ('abuse', 'spam', 'off-topic')
        ),
        status text not null check (status in ('open')),
        created_at timestamptz not null,
        unique (reporter_account_id, target_kind, target_id, status)
      );

      create index if not exists support_content_reports_queue_idx
        on support_content_reports (status, created_at, report_id);

      alter table support_content_reports enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('collaboration-moderation-0001', '2bf6625a5864151497cf7c821c734990138a158ccf742a7dca1c8b97fd770240')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: collaboration-projects-0001
create table if not exists support_collaboration_projects (
        project_id text primary key,
        owner_account_id text not null
          references support_accounts (account_id) on delete cascade,
        title text not null,
        description text not null,
        state text not null check (state in ('open', 'closed')),
        linked_repository_ids jsonb not null default '[]'::jsonb check (
          jsonb_typeof(linked_repository_ids) = 'array'
        ),
        items jsonb not null default '[]'::jsonb check (
          jsonb_typeof(items) = 'array'
        ),
        updated_at timestamptz not null
      );

      create index if not exists support_collaboration_projects_owner_idx
        on support_collaboration_projects (
          owner_account_id,
          updated_at desc,
          project_id
        );

      create index if not exists
        support_collaboration_projects_repository_ids_idx
        on support_collaboration_projects using gin (linked_repository_ids);

      alter table support_collaboration_projects enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('collaboration-projects-0001', '37d60ae7e74da246561c0e38d00be8adc1b70c3471f9b9798339a4490e9befb8')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: engagement-notifications-0001
create table if not exists support_notifications (
        notification_id text primary key,
        recipient_account_id text not null
          references support_accounts (account_id) on delete cascade,
        repository_id text not null
          references support_repositories (repository_id) on delete cascade,
        repository_label text not null,
        subject_label text not null,
        subject_href text not null,
        reason text not null check (
          reason in ('subscribed', 'mention', 'participating')
        ),
        state text not null check (state in ('unread', 'read')),
        updated_at timestamptz not null
      );

      create index if not exists support_notifications_inbox_idx
        on support_notifications (
          recipient_account_id,
          state,
          updated_at desc,
          notification_id
        );

      alter table support_notifications enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('engagement-notifications-0001', '1b73b250dda2882197cf075a662b9ea96b42650f7f0f87557c6caba1764f3788')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: engagement-stars-0001
create table if not exists support_repository_stars (
        repository_id text not null
          references support_repositories (repository_id) on delete cascade,
        account_id text not null
          references support_accounts (account_id) on delete cascade,
        username text not null,
        starred_at timestamptz not null,
        primary key (repository_id, account_id)
      );

      create index if not exists support_repository_stars_account_idx
        on support_repository_stars (
          account_id,
          starred_at desc,
          repository_id
        );

      alter table support_repository_stars enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('engagement-stars-0001', '4770e4659ed744b0a379e25c98ef9432118095524c8e9d253599b0730b7d69b3')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: engagement-subscriptions-0001
create table if not exists support_repository_subscriptions (
          repository_id text not null
            references support_repositories (repository_id) on delete cascade,
          account_id text not null
            references support_accounts (account_id) on delete cascade,
          username text not null,
          subscribed_at timestamptz not null,
          primary key (repository_id, account_id)
        );

        create index if not exists
          support_repository_subscriptions_account_idx
          on support_repository_subscriptions (
            account_id,
            subscribed_at desc,
            repository_id
          );

        alter table support_repository_subscriptions
          enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('engagement-subscriptions-0001', '56927e4dc89823fdd8c413531f98aa8a82e9fbd667dd4fe8c9cffd17cc46540c')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: platform-media-storage-0001
create table if not exists support_media_objects (
        media_id text primary key,
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
        operation_id bigserial primary key,
        media_id text not null
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('platform-media-storage-0001', '657ea83b95c64da4152dbeb139c38f908f77f36fc6845b20f864e2c9c7ddbb83')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: platform-search-index-0001
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('platform-search-index-0001', 'aad08dfe6d5dcbb16ffb24c2400c44ebd41139dce35529a058dfa80fadec2fbd')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: projections-activity-feed-0001
create or replace view support_repository_activity_feed
      with (security_invoker = true) as
      select
        'issue:' || issue.issue_id as activity_id,
        issue.repository_id,
        issue.author_username as actor_username,
        'issue-opened'::text as kind,
        'opened issue #' || issue.number::text as summary,
        '/' || repository.owner_username || '/' || repository.name ||
          '/issues/' || issue.number::text as href,
        issue.created_at as occurred_at
      from support_repository_issues issue
      join support_repositories repository
        on repository.repository_id = issue.repository_id
      where repository.lifecycle_state <> 'deleted'
      union all
      select
        'comment:' || comment.comment_id as activity_id,
        issue.repository_id,
        comment.author_username as actor_username,
        'comment-added'::text as kind,
        'commented on issue #' || issue.number::text as summary,
        '/' || repository.owner_username || '/' || repository.name ||
          '/issues/' || issue.number::text as href,
        comment.created_at as occurred_at
      from support_conversation_comments comment
      join support_repository_issues issue
        on comment.subject_kind = 'issue'
       and comment.subject_id = issue.issue_id
      join support_repositories repository
        on repository.repository_id = issue.repository_id
      where repository.lifecycle_state <> 'deleted'
      union all
      select
        'star:' || star.repository_id || ':' || star.account_id
          as activity_id,
        star.repository_id,
        star.username as actor_username,
        'repository-starred'::text as kind,
        'starred this repository'::text as summary,
        '/' || repository.owner_username || '/' || repository.name as href,
        star.starred_at as occurred_at
      from support_repository_stars star
      join support_repositories repository
        on repository.repository_id = star.repository_id
      where repository.lifecycle_state <> 'deleted';

insert into public.support_schema_migrations (migration_id, checksum)
values ('projections-activity-feed-0001', '9e5e54af6bffadfff2d2c5dd1b298423c2f44c0c49eb9c1a09ac0f3fa70596c3')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: projections-dashboard-selection-0001
create table if not exists support_dashboard_selections (
          session_id text primary key,
          context_kind text not null check (
            context_kind in ('personal', 'organization')
          ),
          account_id text,
          organization_id text,
          login text not null,
          display_name text not null,
          relationship text check (
            relationship is null or relationship in ('member', 'owner')
          ),
          updated_at timestamptz not null default now(),
          check (
            (
              context_kind = 'personal'
              and account_id is not null
              and organization_id is null
              and relationship is null
            ) or (
              context_kind = 'organization'
              and account_id is null
              and organization_id is not null
              and relationship is not null
            )
          )
        );

        create index if not exists
          support_dashboard_selections_updated_idx
          on support_dashboard_selections (updated_at);

        alter table support_dashboard_selections
          enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('projections-dashboard-selection-0001', '09c37fa09135134f96f69335fd5e002fe86bcb77851eeaab1d3ed5343aec64bb')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: projections-discovery-0001
create or replace view support_public_repository_discovery
      with (security_invoker = true) as
      select
        repository_id,
        owner_username,
        name,
        description,
        updated_at
      from support_repositories
      where visibility = 'public'
        and lifecycle_state = 'active';

insert into public.support_schema_migrations (migration_id, checksum)
values ('projections-discovery-0001', 'bf453d840c7a7e662c718a9e05fe8155a7dd6ac7a5af7403353c4ff610af2de9')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607300100_supabase_runtime_security
do $$
        declare
          table_row record;
        begin
          if not exists (
            select 1 from pg_roles where rolname = 'support_web_runtime'
          ) then
            raise exception
              'Required database role support_web_runtime does not exist.';
          end if;

          grant usage on schema public to support_web_runtime;

          for table_row in
            select schemaname, tablename
              from pg_tables
             where schemaname = 'public'
               and tablename like 'support\_%' escape '\'
          loop
            execute format(
              'alter table %I.%I enable row level security',
              table_row.schemaname,
              table_row.tablename
            );
            execute format(
              'alter table %I.%I force row level security',
              table_row.schemaname,
              table_row.tablename
            );
            execute format(
              'revoke all privileges on table %I.%I from public',
              table_row.schemaname,
              table_row.tablename
            );
            if exists (select 1 from pg_roles where rolname = 'anon') then
              execute format(
                'revoke all privileges on table %I.%I from anon',
                table_row.schemaname,
                table_row.tablename
              );
            end if;
            if exists (
              select 1 from pg_roles where rolname = 'authenticated'
            ) then
              execute format(
                'revoke all privileges on table %I.%I from authenticated',
                table_row.schemaname,
                table_row.tablename
              );
            end if;
            if exists (
              select 1 from pg_roles where rolname = 'service_role'
            ) then
              execute format(
                'revoke all privileges on table %I.%I from service_role',
                table_row.schemaname,
                table_row.tablename
              );
            end if;
            execute format(
              'grant select, insert, update, delete on table %I.%I to support_web_runtime',
              table_row.schemaname,
              table_row.tablename
            );
            execute format(
              'drop policy if exists support_web_runtime_access on %I.%I',
              table_row.schemaname,
              table_row.tablename
            );
            execute format(
              'create policy support_web_runtime_access on %I.%I for all to support_web_runtime using (true) with check (true)',
              table_row.schemaname,
              table_row.tablename
            );
          end loop;
        end
        $$;

        create index if not exists
          support_enterprise_memberships_account_fk_idx
          on support_enterprise_memberships (account_id);
        create index if not exists
          support_enterprise_role_assignments_account_fk_idx
          on support_enterprise_role_assignments (account_id);
        create index if not exists
          support_enterprise_team_membership_assignments_membership_fk_idx
          on support_enterprise_team_membership_assignments (membership_id);
        create index if not exists
          support_enterprise_team_memberships_account_fk_idx
          on support_enterprise_team_memberships (account_id);
        create index if not exists
          support_enterprise_team_memberships_enterprise_fk_idx
          on support_enterprise_team_memberships (enterprise_id);
        create index if not exists
          support_enterprise_team_org_grants_organization_fk_idx
          on support_enterprise_team_organization_grants (organization_id);
        create index if not exists
          support_enterprise_team_org_grants_enterprise_fk_idx
          on support_enterprise_team_organization_grants (enterprise_id);
        create index if not exists
          support_organization_invitations_inviter_fk_idx
          on support_organization_invitations (inviter_account_id);
        create index if not exists
          support_organization_invitations_membership_fk_idx
          on support_organization_invitations (membership_id);
        create index if not exists
          support_organization_notification_routes_email_fk_idx
          on support_organization_notification_routes (email_id);
        create index if not exists
          support_organization_team_maintainers_account_fk_idx
          on support_organization_team_maintainers (account_id);
        create index if not exists
          support_organization_teams_parent_fk_idx
          on support_organization_teams (parent_team_id);
        create index if not exists
          support_repository_account_grants_account_fk_idx
          on support_repository_account_grants (account_id);
        create index if not exists
          support_repository_property_values_property_fk_idx
          on support_repository_property_values (property_id);
        create index if not exists
          support_repository_property_values_actor_fk_idx
          on support_repository_property_values (updated_by_account_id);
        create index if not exists
          support_repository_team_grants_team_fk_idx
          on support_repository_team_grants (team_id);

        insert into storage.buckets (
          id,
          name,
          public,
          file_size_limit
        ) values (
          'support-media',
          'support-media',
          false,
          52428800
        )
        on conflict (id) do update
          set public = false;

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607300100_supabase_runtime_security', 'cdd95315dd870e2c509c4c28d2c8905d963a41364236f6df94ece41755e9ada6')
on conflict (migration_id) do update set checksum = excluded.checksum;

commit;
