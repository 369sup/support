-- Reset-only physical redesign. This migration intentionally refuses to run
-- against a database containing Auth users, Storage objects, or product rows.
begin;

do $$
declare
  relation record;
  contains_rows boolean;
begin
  if exists (select 1 from auth.users limit 1) then
    raise exception 'UUID physical redesign requires an empty Auth database.';
  end if;
  if exists (select 1 from storage.objects limit 1) then
    raise exception 'UUID physical redesign requires empty Storage objects.';
  end if;

  for relation in
    select schemaname, tablename
    from pg_tables
    where schemaname like 'support\_%' escape '\'
      and schemaname <> 'support_private'
  loop
    execute format(
      'select exists (select 1 from %I.%I limit 1)',
      relation.schemaname,
      relation.tablename
    ) into contains_rows;
    if contains_rows then
      raise exception 'UUID physical redesign requires empty product table %.%.',
        relation.schemaname,
        relation.tablename;
    end if;
  end loop;
end
$$;

do $$
declare
  namespace record;
begin
  for namespace in
    select nspname
    from pg_namespace
    where nspname like 'support\_%' escape '\'
    order by nspname
  loop
    execute format('drop schema %I cascade', namespace.nspname);
  end loop;
end
$$;

-- Source: 00_infrastructure.sql
-- Private infrastructure and bounded-context namespaces.
create schema if not exists support_private;
create schema if not exists support_identity_accounts;
create schema if not exists support_identity_account_emails;
create schema if not exists support_identity_account_registration;
create schema if not exists support_identity_authentication;
create schema if not exists support_identity_profiles;
create schema if not exists support_identity_social_graph;
create schema if not exists support_enterprises_enterprises;
create schema if not exists support_enterprises_enterprise_memberships;
create schema if not exists support_enterprises_enterprise_roles;
create schema if not exists support_enterprises_enterprise_teams;
create schema if not exists support_organizations_organizations;
create schema if not exists support_organizations_organization_memberships;
create schema if not exists support_organizations_organization_teams;
create schema if not exists support_organizations_organization_roles;
create schema if not exists support_organizations_organization_policies;
create schema if not exists support_organizations_custom_properties;
create schema if not exists support_repositories_repositories;
create schema if not exists support_repositories_repository_access;
create schema if not exists support_collaboration_conversations;
create schema if not exists support_collaboration_discussions;
create schema if not exists support_collaboration_issues;
create schema if not exists support_collaboration_moderation;
create schema if not exists support_collaboration_projects;
create schema if not exists support_engagement_notifications;
create schema if not exists support_engagement_stars;
create schema if not exists support_engagement_subscriptions;
create schema if not exists support_platform_audit_storage;
create schema if not exists support_platform_event_publication;
create schema if not exists support_platform_notification_channels;
create schema if not exists support_platform_scheduled_commands;
create schema if not exists support_platform_media_storage;
create schema if not exists support_platform_search_index;
create schema if not exists support_projections_dashboard;
create schema if not exists support_projections_activity_feed;
create schema if not exists support_projections_discovery;
create schema if not exists support_projections_search;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'support_web_runtime') then
    create role support_web_runtime nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
  end if;
end
$$;


-- Source: 20_identity.sql
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

      create schema if not exists support_private;
      revoke all on schema support_private from public;
      revoke all on schema support_private from anon;
      revoke all on schema support_private from authenticated;

      create or replace function support_private.provision_supabase_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_account_id uuid := gen_random_uuid();
        support_email_id uuid := gen_random_uuid();
        support_username text := btrim(
          coalesce(new.raw_user_meta_data ->> 'username', '')
        );
        support_email text := btrim(coalesce(new.email, ''));
      begin
        if support_username !~ '^[A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?$' then
          raise exception using
            errcode = 'check_violation',
            message = 'Supabase account profile is invalid.';
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
        support_account_id uuid;
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
          raise exception using
            errcode = 'foreign_key_violation',
            message = 'Supabase account identity is unavailable.';
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

      drop trigger if exists support_on_auth_user_created on auth.users;
      create trigger support_on_auth_user_created
        after insert on auth.users
        for each row execute function
          support_private.provision_supabase_user();

      drop trigger if exists support_on_auth_user_email_changed on auth.users;
      create trigger support_on_auth_user_email_changed
        after update of email, email_confirmed_at on auth.users
        for each row
        when (
          old.email is distinct from new.email or
          old.email_confirmed_at is distinct from new.email_confirmed_at
        )
        execute function support_private.sync_supabase_user_email();

-- Historical origin: identity-authentication-supabase-0002
create or replace function support_private.provision_supabase_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_account_id uuid := gen_random_uuid();
        support_email_id uuid := gen_random_uuid();
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
        support_account_id uuid;
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


-- Source: 30_governance.sql
-- Desired database state. Do not edit migration history to change it.

-- Historical origin: zz010_organizations_organizations
create table if not exists support_organizations (
        organization_id uuid primary key,
        login text not null,
        normalized_login text not null unique,
        display_name text not null,
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      alter table support_organizations enable row level security;

-- Historical origin: zz020_enterprises_enterprises
create table if not exists support_enterprises (
        enterprise_id uuid primary key,
        slug text not null,
        normalized_slug text not null unique,
        display_name text not null,
        enterprise_type text not null check (enterprise_type in ('standard', 'managed-users')),
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      create table if not exists support_enterprise_organizations (
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        organization_id uuid not null references support_organizations(organization_id),
        attached_at timestamptz not null default now(),
        primary key (enterprise_id, organization_id),
        unique (organization_id)
      );

      create table if not exists support_enterprise_memberships (
        membership_id uuid primary key,
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        account_id uuid not null references support_accounts(account_id),
        affiliation text not null check (affiliation in ('direct', 'organization-derived')),
        state text not null check (state in ('active', 'pending', 'suspended', 'removed')),
        unique (enterprise_id, account_id)
      );

      create table if not exists support_enterprise_role_assignments (
        assignment_id uuid primary key,
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        account_id uuid not null references support_accounts(account_id),
        role_name text not null check (role_name in ('enterprise-owner', 'enterprise-admin')),
        permissions text[] not null,
        unique (enterprise_id, account_id, role_name)
      );

      create index if not exists support_enterprise_memberships_account_fk_idx
        on support_enterprise_memberships (account_id);
      create index if not exists support_enterprise_role_assignments_account_fk_idx
        on support_enterprise_role_assignments (account_id);

      alter table support_enterprises enable row level security;
      alter table support_enterprise_organizations enable row level security;
      alter table support_enterprise_memberships enable row level security;
      alter table support_enterprise_role_assignments enable row level security;

-- Historical origin: zz030_organizations_organization_memberships
create table if not exists support_organization_memberships (
          membership_id uuid primary key,
          organization_id uuid not null references support_organizations(organization_id),
          account_id uuid not null references support_accounts(account_id),
          role text not null check (role in ('member', 'owner')),
          state text not null check (state in ('active', 'pending', 'suspended', 'removed')),
          source text not null check (source in ('direct', 'enterprise-managed', 'identity-provider-group')),
          unique (organization_id, account_id)
        );

        create table if not exists support_organization_invitations (
          invitation_id uuid primary key,
          membership_id uuid not null references support_organization_memberships(membership_id),
          organization_id uuid not null references support_organizations(organization_id),
          account_id uuid not null references support_accounts(account_id),
          inviter_account_id uuid not null references support_accounts(account_id),
          role text not null check (role in ('member', 'owner')),
          state text not null check (state in ('pending', 'accepted', 'declined', 'canceled', 'expired')),
          created_at timestamptz not null,
          expires_at timestamptz not null,
          decided_at timestamptz
        );

        create table if not exists support_enterprise_team_membership_assignments (
          assignment_id uuid not null,
          membership_id uuid not null references support_organization_memberships(membership_id),
          primary key (assignment_id, membership_id)
        );

        create index if not exists support_org_memberships_account_idx
          on support_organization_memberships (account_id, organization_id);
        create index if not exists support_org_invitations_account_idx
          on support_organization_invitations (account_id, created_at desc);
        create index if not exists support_org_invitations_org_idx
          on support_organization_invitations (organization_id, created_at desc);
        create index if not exists support_organization_invitations_membership_fk_idx
          on support_organization_invitations (membership_id);
        create index if not exists support_organization_invitations_inviter_fk_idx
          on support_organization_invitations (inviter_account_id);
        create index if not exists support_enterprise_team_membership_assignments_membership_fk_id
          on support_enterprise_team_membership_assignments (membership_id);

        create or replace function support_private.protect_last_organization_owner()
        returns trigger
        language plpgsql
        security definer
        set search_path = ''
        as $$
        begin
          if old.role = 'owner' and old.state = 'active'
             and (new.role <> 'owner' or new.state <> 'active') then
            perform pg_advisory_xact_lock(hashtext('support-org-owner:' || old.organization_id));
            if not exists (
              select 1
                from public.support_organization_memberships
               where organization_id = old.organization_id
                 and membership_id <> old.membership_id
                 and role = 'owner'
                 and state = 'active'
            ) then
              raise exception 'An organization must retain at least one active owner.';
            end if;
          end if;
          return new;
        end
        $$;

        revoke all on function support_private.protect_last_organization_owner()
          from public, anon, authenticated;

        drop trigger if exists support_protect_last_organization_owner
          on support_organization_memberships;
        create trigger support_protect_last_organization_owner
          before update on support_organization_memberships
          for each row execute function support_private.protect_last_organization_owner();

        alter table support_organization_memberships enable row level security;
        alter table support_organization_invitations enable row level security;
        alter table support_enterprise_team_membership_assignments enable row level security;

-- Historical origin: zz040_organizations_organization_teams
create table if not exists support_organization_teams (
        team_id uuid primary key,
        organization_id uuid not null references support_organizations(organization_id),
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        visibility text not null check (visibility in ('visible', 'secret')),
        parent_team_id uuid references support_organization_teams(team_id),
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (organization_id, normalized_slug),
        check (visibility = 'visible' or parent_team_id is null)
      );

      create table if not exists support_organization_team_memberships (
        team_membership_id uuid primary key,
        team_id uuid not null references support_organization_teams(team_id),
        organization_id uuid not null references support_organizations(organization_id),
        account_id uuid not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_organization_team_maintainers (
        team_maintainer_id uuid primary key,
        team_id uuid not null references support_organization_teams(team_id),
        organization_id uuid not null references support_organizations(organization_id),
        account_id uuid not null references support_accounts(account_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, account_id)
      );

      create index if not exists support_team_memberships_account_org_idx
        on support_organization_team_memberships (account_id, organization_id)
        where state = 'active';
      create index if not exists support_organization_teams_parent_fk_idx
        on support_organization_teams (parent_team_id);
      create index if not exists support_organization_team_maintainers_account_fk_idx
        on support_organization_team_maintainers (account_id);

      alter table support_organization_teams enable row level security;
      alter table support_organization_team_memberships enable row level security;
      alter table support_organization_team_maintainers enable row level security;

-- Historical origin: zz045_enterprises_enterprise_teams
create table if not exists support_enterprise_teams (
        team_id uuid primary key,
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (enterprise_id, normalized_slug)
      );

      create table if not exists support_enterprise_team_memberships (
        team_membership_id uuid primary key,
        team_id uuid not null references support_enterprise_teams(team_id),
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        account_id uuid not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_enterprise_team_organization_grants (
        grant_id uuid primary key,
        team_id uuid not null references support_enterprise_teams(team_id),
        enterprise_id uuid not null references support_enterprises(enterprise_id),
        organization_id uuid not null references support_organizations(organization_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, organization_id)
      );

      create index if not exists support_enterprise_team_memberships_team_state_idx
        on support_enterprise_team_memberships (team_id, state);
      create index if not exists support_enterprise_team_org_grants_team_state_idx
        on support_enterprise_team_organization_grants (team_id, state);
      create index if not exists support_enterprise_team_memberships_account_fk_idx
        on support_enterprise_team_memberships (account_id);
      create index if not exists support_enterprise_team_memberships_enterprise_fk_idx
        on support_enterprise_team_memberships (enterprise_id);
      create index if not exists support_enterprise_team_org_grants_enterprise_fk_idx
        on support_enterprise_team_organization_grants (enterprise_id);
      create index if not exists support_enterprise_team_org_grants_organization_fk_idx
        on support_enterprise_team_organization_grants (organization_id);

      alter table support_enterprise_teams enable row level security;
      alter table support_enterprise_team_memberships enable row level security;
      alter table support_enterprise_team_organization_grants enable row level security;

-- Historical origin: zz046_organizations_organization_roles
create table if not exists support_organization_role_assignments (
          assignment_id uuid primary key,
          organization_id uuid not null references support_organizations(organization_id),
          role_key text not null check (
            role_key in (
              'moderator',
              'security-manager',
              'ci-cd-admin',
              'app-manager',
              'all-repository-read',
              'all-repository-triage',
              'all-repository-write',
              'all-repository-maintain',
              'all-repository-admin'
            )
          ),
          subject_kind text not null check (subject_kind in ('account', 'team')),
          subject_id uuid not null,
          state text not null check (state in ('active', 'revoked')),
          unique (organization_id, subject_kind, subject_id, role_key)
        );

        create index if not exists support_org_role_assignments_org_state_idx
          on support_organization_role_assignments (organization_id, state);

        alter table support_organization_role_assignments enable row level security;

-- Historical origin: zz047_organizations_organization_policies
create table if not exists support_organization_policies (
          organization_id uuid primary key references support_organizations(organization_id),
          base_repository_permission text check (
            base_repository_permission in ('read', 'triage', 'write', 'maintain', 'admin')
          ),
          outside_collaborator_oauth_allowed boolean not null default true,
          allowed_oauth_scopes text[] not null default '{}',
          outside_collaborator_github_app_allowed boolean not null default true,
          owner_approval_required_for_additional_permissions boolean not null default false
        );

        alter table support_organization_policies enable row level security;

-- Historical origin: zz070_organizations_custom_properties
create table if not exists support_organization_repository_properties (
        property_id uuid primary key,
        organization_id uuid not null references support_organizations(organization_id),
        name text not null,
        normalized_name text not null,
        description text not null default '',
        value_type text not null check (value_type in ('text', 'single-select', 'multi-select', 'true-false')),
        allowed_values jsonb not null default '[]'::jsonb,
        default_value jsonb,
        required boolean not null default false,
        require_explicit_value boolean not null default false,
        repository_actors_can_set boolean not null default false,
        unique (organization_id, normalized_name),
        check (jsonb_typeof(allowed_values) = 'array')
      );

      alter table support_organization_repository_properties enable row level security;


-- Source: 40_repository.sql
-- Desired database state. Do not edit migration history to change it.

-- Historical origin: zz050_repositories_repositories
create table if not exists support_repositories (
        repository_id uuid primary key,
        owner_kind text not null check (owner_kind in ('personal', 'organization')),
        owner_id uuid not null,
        owner_username text not null,
        normalized_name text not null,
        name text not null,
        description text not null default '',
        homepage text not null default '',
        visibility text not null check (visibility in ('public', 'private', 'internal')),
        lifecycle_state text not null check (lifecycle_state in ('active', 'archived', 'deleted')),
        version integer not null check (version >= 1),
        created_at timestamptz not null,
        updated_at timestamptz not null,
        deleted_at timestamptz,
        restore_until timestamptz,
        unique (owner_id, normalized_name)
      );

      create index if not exists support_repositories_owner_idx
        on support_repositories (owner_id, updated_at desc);

      alter table support_repositories enable row level security;

-- Historical origin: zz060_repositories_repository_access
create table if not exists support_repository_account_grants (
        grant_id uuid primary key,
        repository_id uuid not null references support_repositories(repository_id),
        account_id uuid not null references support_accounts(account_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, account_id)
      );

      create table if not exists support_repository_team_grants (
        grant_id uuid primary key,
        repository_id uuid not null references support_repositories(repository_id),
        organization_id uuid not null references support_organizations(organization_id),
        team_id uuid not null references support_organization_teams(team_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, team_id)
      );

      create index if not exists support_repository_account_grants_account_fk_idx
        on support_repository_account_grants (account_id);
      create index if not exists support_repository_team_grants_team_fk_idx
        on support_repository_team_grants (team_id);

      alter table support_repository_account_grants enable row level security;
      alter table support_repository_team_grants enable row level security;


-- Source: 45_governance_repository_relations.sql
-- Cross-context relation loaded only after organization, repository, and
-- account authorities exist. Ownership remains organizations/custom-properties.
create table if not exists support_repository_property_values (
  repository_id uuid not null references support_repositories(repository_id),
  property_id uuid not null references support_organization_repository_properties(property_id),
  value jsonb,
  source text not null check (source in ('explicit', 'default')),
  updated_by_account_id uuid not null references support_accounts(account_id),
  updated_at timestamptz not null default now(),
  primary key (repository_id, property_id)
);

create index if not exists support_repository_property_values_search_idx
  on support_repository_property_values using gin (value);
create index if not exists support_repository_property_values_actor_fk_idx
  on support_repository_property_values (updated_by_account_id);
create index if not exists support_repository_property_values_property_fk_idx
  on support_repository_property_values (property_id);

alter table support_repository_property_values enable row level security;


-- Source: 50_collaboration.sql
-- Desired database state. Do not edit migration history to change it.

-- Historical origin: collaboration-conversations-0001
create table if not exists support_conversation_subjects (
        subject_kind text not null check (
          subject_kind in ('issue', 'discussion')
        ),
        subject_id uuid not null,
        is_locked boolean not null default false,
        updated_at timestamptz not null default now(),
        primary key (subject_kind, subject_id)
      );

      create table if not exists support_conversation_comments (
        comment_id uuid primary key,
        subject_kind text not null check (
          subject_kind in ('issue', 'discussion')
        ),
        subject_id uuid not null,
        author_account_id uuid not null
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
        comment_id uuid not null
          references support_conversation_comments (comment_id)
          on delete cascade,
        actor_account_id uuid not null
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

-- Historical origin: collaboration-discussions-0001
create table if not exists support_repository_discussion_counters (
        repository_id uuid primary key
          references support_repositories (repository_id) on delete cascade,
        next_number integer not null check (next_number > 0)
      );

      create table if not exists support_repository_discussions (
        discussion_id uuid primary key,
        repository_id uuid not null
          references support_repositories (repository_id) on delete cascade,
        number integer not null check (number > 0),
        title text not null,
        body text not null,
        category text not null check (
          category in ('announcements', 'general', 'q-and-a')
        ),
        state text not null check (state in ('open', 'closed')),
        author_account_id uuid not null
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

-- Historical origin: collaboration-issues-0001
create table if not exists support_repository_issue_counters (
        repository_id uuid primary key
          references support_repositories (repository_id) on delete cascade,
        next_number integer not null check (next_number > 0)
      );

      create table if not exists support_repository_issues (
        issue_id uuid primary key,
        repository_id uuid not null
          references support_repositories (repository_id) on delete cascade,
        number integer not null check (number > 0),
        title text not null,
        body text not null,
        state text not null check (state in ('open', 'closed')),
        author_account_id uuid not null
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

-- Historical origin: collaboration-moderation-0001
create table if not exists support_content_reports (
        report_id uuid primary key,
        reporter_account_id uuid not null
          references support_accounts (account_id) on delete cascade,
        target_kind text not null check (
          target_kind in ('issue', 'comment')
        ),
        target_id uuid not null,
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

-- Historical origin: collaboration-projects-0001
create table if not exists support_collaboration_projects (
        project_id uuid primary key,
        owner_account_id uuid not null
          references support_accounts (account_id) on delete cascade,
        title text not null,
        description text not null,
        state text not null check (state in ('open', 'closed')),
        updated_at timestamptz not null
      );

      create table if not exists support_project_repositories (
        project_id uuid not null
          references support_collaboration_projects (project_id) on delete cascade,
        repository_id uuid not null
          references support_repositories (repository_id) on delete cascade,
        primary key (project_id, repository_id)
      );

      create table if not exists support_project_items (
        item_id uuid primary key,
        project_id uuid not null
          references support_collaboration_projects (project_id) on delete cascade,
        position integer not null check (position >= 0),
        title text not null,
        status text not null check (status in ('backlog', 'in-progress', 'done')),
        unique (project_id, position)
      );

      create index if not exists support_collaboration_projects_owner_idx
        on support_collaboration_projects (
          owner_account_id,
          updated_at desc,
          project_id
        );

      create index if not exists support_project_repositories_repository_idx
        on support_project_repositories (repository_id, project_id);
      create index if not exists support_project_items_project_idx
        on support_project_items (project_id, position);

      alter table support_collaboration_projects enable row level security;
      alter table support_project_repositories enable row level security;
      alter table support_project_items enable row level security;


-- Source: 60_engagement.sql
-- Desired database state. Do not edit migration history to change it.

-- Historical origin: engagement-notifications-0001
create table if not exists support_notifications (
        notification_id uuid primary key,
        recipient_account_id uuid not null
          references support_accounts (account_id) on delete cascade,
        repository_id uuid not null
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

-- Historical origin: engagement-stars-0001
create table if not exists support_repository_stars (
        repository_id uuid not null
          references support_repositories (repository_id) on delete cascade,
        account_id uuid not null
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

-- Historical origin: engagement-subscriptions-0001
create table if not exists support_repository_subscriptions (
          repository_id uuid not null
            references support_repositories (repository_id) on delete cascade,
          account_id uuid not null
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


-- Source: 70_platform.sql
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


-- Source: 80_projections.sql
-- Desired database state. Do not edit migration history to change it.

-- Historical origin: projections-activity-feed-0001
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

-- Historical origin: projections-dashboard-selection-0001
create table if not exists support_dashboard_selections (
          session_id text primary key,
          context_kind text not null check (
            context_kind in ('personal', 'organization')
          ),
          account_id uuid references support_accounts(account_id) on delete cascade,
          organization_id uuid references support_organizations(organization_id) on delete cascade,
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

-- Historical origin: projections-discovery-0001
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


-- Source: 90_namespaces_and_contract.sql
-- Final ownership namespaces. Objects are first declared in dependency order,
-- then relocated so the resulting state has one schema per active context.
alter table if exists public.support_accounts set schema support_identity_accounts;
alter table if exists public.support_account_identity_transactions set schema support_identity_accounts;
alter table if exists public.support_account_emails set schema support_identity_account_emails;
alter table if exists public.support_released_account_emails set schema support_identity_account_emails;
alter table if exists public.support_email_verifications set schema support_identity_account_emails;
alter table if exists public.support_auth_identities set schema support_identity_authentication;
alter table if exists public.support_profiles set schema support_identity_profiles;
alter table if exists public.support_user_follows set schema support_identity_social_graph;
alter table if exists public.support_enterprises set schema support_enterprises_enterprises;
alter table if exists public.support_enterprise_organizations set schema support_enterprises_enterprises;
alter table if exists public.support_enterprise_memberships set schema support_enterprises_enterprise_memberships;
alter table if exists public.support_enterprise_role_assignments set schema support_enterprises_enterprise_roles;
alter table if exists public.support_enterprise_teams set schema support_enterprises_enterprise_teams;
alter table if exists public.support_enterprise_team_memberships set schema support_enterprises_enterprise_teams;
alter table if exists public.support_enterprise_team_organization_grants set schema support_enterprises_enterprise_teams;
alter table if exists public.support_organizations set schema support_organizations_organizations;
alter table if exists public.support_organization_memberships set schema support_organizations_organization_memberships;
alter table if exists public.support_organization_invitations set schema support_organizations_organization_memberships;
alter table if exists public.support_enterprise_team_membership_assignments set schema support_organizations_organization_memberships;
alter table if exists public.support_organization_notification_routes set schema support_organizations_organization_memberships;
alter table if exists public.support_organization_teams set schema support_organizations_organization_teams;
alter table if exists public.support_organization_team_memberships set schema support_organizations_organization_teams;
alter table if exists public.support_organization_team_maintainers set schema support_organizations_organization_teams;
alter table if exists public.support_organization_role_assignments set schema support_organizations_organization_roles;
alter table if exists public.support_organization_policies set schema support_organizations_organization_policies;
alter table if exists public.support_organization_repository_properties set schema support_organizations_custom_properties;
alter table if exists public.support_repository_property_values set schema support_organizations_custom_properties;
alter table if exists public.support_repositories set schema support_repositories_repositories;
alter table if exists public.support_repository_account_grants set schema support_repositories_repository_access;
alter table if exists public.support_repository_team_grants set schema support_repositories_repository_access;
alter table if exists public.support_conversation_subjects set schema support_collaboration_conversations;
alter table if exists public.support_conversation_comments set schema support_collaboration_conversations;
alter table if exists public.support_conversation_reactions set schema support_collaboration_conversations;
alter table if exists public.support_repository_discussion_counters set schema support_collaboration_discussions;
alter table if exists public.support_repository_discussions set schema support_collaboration_discussions;
alter table if exists public.support_repository_issue_counters set schema support_collaboration_issues;
alter table if exists public.support_repository_issues set schema support_collaboration_issues;
alter table if exists public.support_content_reports set schema support_collaboration_moderation;
alter table if exists public.support_collaboration_projects set schema support_collaboration_projects;
alter table if exists public.support_project_repositories set schema support_collaboration_projects;
alter table if exists public.support_project_items set schema support_collaboration_projects;
alter table if exists public.support_notifications set schema support_engagement_notifications;
alter table if exists public.support_repository_stars set schema support_engagement_stars;
alter table if exists public.support_repository_subscriptions set schema support_engagement_subscriptions;
alter table if exists public.support_audit_records set schema support_platform_audit_storage;
alter table if exists public.support_audit_exports set schema support_platform_audit_storage;
alter table if exists public.support_audit_retention_executions set schema support_platform_audit_storage;
alter table if exists public.support_event_outbox set schema support_platform_event_publication;
alter table if exists public.support_event_publication_attempts set schema support_platform_event_publication;
alter table if exists public.support_event_publication_receipts set schema support_platform_event_publication;
alter table if exists public.support_event_publication_dead_letters set schema support_platform_event_publication;
alter table if exists public.support_channel_deliveries set schema support_platform_notification_channels;
alter table if exists public.support_scheduled_commands set schema support_platform_scheduled_commands;
alter table if exists public.support_media_objects set schema support_platform_media_storage;
alter table if exists public.support_media_storage_operations set schema support_platform_media_storage;
alter table if exists public.support_search_documents set schema support_platform_search_index;
alter table if exists public.support_dashboard_selections set schema support_projections_dashboard;
alter view if exists public.support_repository_activity_feed set schema support_projections_activity_feed;
alter view if exists public.support_public_repository_discovery set schema support_projections_discovery;

create table if not exists support_private.schema_contract (
  contract_name text primary key check (contract_name = 'support-web'),
  contract_version text not null,
  applied_at timestamptz not null default now()
);


-- Source: 95_auth_and_storage.sql
-- Auth trigger functions are private, schema-qualified, and deny PUBLIC execution.
-- Historical origin: identity-authentication-supabase-0002
create or replace function support_private.provision_supabase_user()
      returns trigger
      language plpgsql
      security definer
      set search_path = ''
      as $$
      declare
        support_account_id uuid := gen_random_uuid();
        support_email_id uuid := gen_random_uuid();
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
          from support_identity_authentication.support_auth_identities
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

        insert into support_identity_accounts.support_accounts (
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

        insert into support_identity_authentication.support_auth_identities (
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

        insert into support_identity_account_emails.support_account_emails (
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
        support_account_id uuid;
      begin
        if support_email = '' then
          raise exception using
            errcode = 'not_null_violation',
            message = 'Supabase account email is required.';
        end if;

        update support_identity_authentication.support_auth_identities
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

        update support_identity_account_emails.support_account_emails
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

create or replace function support_private.protect_last_organization_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner' and old.state = 'active'
     and (new.role <> 'owner' or new.state <> 'active') then
    perform pg_advisory_xact_lock(
      hashtext('support-org-owner:' || old.organization_id)
    );
    if not exists (
      select 1
      from support_organizations_organization_memberships.support_organization_memberships
      where organization_id = old.organization_id
        and membership_id <> old.membership_id
        and role = 'owner'
        and state = 'active'
    ) then
      raise exception
        'An organization must retain at least one active owner.';
    end if;
  end if;
  return new;
end
$$;

revoke all on function
  support_private.protect_last_organization_owner()
  from public, anon, authenticated, service_role;


-- Source: 99_security.sql
-- Server-only access with forced RLS defense in depth.
revoke all on schema support_private from public, anon, authenticated, service_role;
grant usage on schema support_private to support_web_runtime;
grant select on support_private.schema_contract to support_web_runtime;
revoke all on schema support_identity_accounts from public, anon, authenticated, service_role;
grant usage on schema support_identity_accounts to support_web_runtime;
revoke all on all tables in schema support_identity_accounts from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_accounts to support_web_runtime;
alter default privileges in schema support_identity_accounts revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_accounts grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_identity_account_emails from public, anon, authenticated, service_role;
grant usage on schema support_identity_account_emails to support_web_runtime;
revoke all on all tables in schema support_identity_account_emails from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_account_emails to support_web_runtime;
alter default privileges in schema support_identity_account_emails revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_account_emails grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_identity_authentication from public, anon, authenticated, service_role;
grant usage on schema support_identity_authentication to support_web_runtime;
revoke all on all tables in schema support_identity_authentication from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_authentication to support_web_runtime;
alter default privileges in schema support_identity_authentication revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_authentication grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_identity_profiles from public, anon, authenticated, service_role;
grant usage on schema support_identity_profiles to support_web_runtime;
revoke all on all tables in schema support_identity_profiles from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_profiles to support_web_runtime;
alter default privileges in schema support_identity_profiles revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_profiles grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_identity_social_graph from public, anon, authenticated, service_role;
grant usage on schema support_identity_social_graph to support_web_runtime;
revoke all on all tables in schema support_identity_social_graph from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_social_graph to support_web_runtime;
alter default privileges in schema support_identity_social_graph revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_social_graph grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_enterprises_enterprises from public, anon, authenticated, service_role;
grant usage on schema support_enterprises_enterprises to support_web_runtime;
revoke all on all tables in schema support_enterprises_enterprises from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_enterprises_enterprises to support_web_runtime;
alter default privileges in schema support_enterprises_enterprises revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_enterprises_enterprises grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_enterprises_enterprise_memberships from public, anon, authenticated, service_role;
grant usage on schema support_enterprises_enterprise_memberships to support_web_runtime;
revoke all on all tables in schema support_enterprises_enterprise_memberships from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_enterprises_enterprise_memberships to support_web_runtime;
alter default privileges in schema support_enterprises_enterprise_memberships revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_enterprises_enterprise_memberships grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_enterprises_enterprise_roles from public, anon, authenticated, service_role;
grant usage on schema support_enterprises_enterprise_roles to support_web_runtime;
revoke all on all tables in schema support_enterprises_enterprise_roles from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_enterprises_enterprise_roles to support_web_runtime;
alter default privileges in schema support_enterprises_enterprise_roles revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_enterprises_enterprise_roles grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_enterprises_enterprise_teams from public, anon, authenticated, service_role;
grant usage on schema support_enterprises_enterprise_teams to support_web_runtime;
revoke all on all tables in schema support_enterprises_enterprise_teams from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_enterprises_enterprise_teams to support_web_runtime;
alter default privileges in schema support_enterprises_enterprise_teams revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_enterprises_enterprise_teams grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_organizations from public, anon, authenticated, service_role;
grant usage on schema support_organizations_organizations to support_web_runtime;
revoke all on all tables in schema support_organizations_organizations from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_organizations to support_web_runtime;
alter default privileges in schema support_organizations_organizations revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_organizations grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_organization_memberships from public, anon, authenticated, service_role;
grant usage on schema support_organizations_organization_memberships to support_web_runtime;
revoke all on all tables in schema support_organizations_organization_memberships from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_organization_memberships to support_web_runtime;
alter default privileges in schema support_organizations_organization_memberships revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_organization_memberships grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_organization_teams from public, anon, authenticated, service_role;
grant usage on schema support_organizations_organization_teams to support_web_runtime;
revoke all on all tables in schema support_organizations_organization_teams from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_organization_teams to support_web_runtime;
alter default privileges in schema support_organizations_organization_teams revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_organization_teams grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_organization_roles from public, anon, authenticated, service_role;
grant usage on schema support_organizations_organization_roles to support_web_runtime;
revoke all on all tables in schema support_organizations_organization_roles from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_organization_roles to support_web_runtime;
alter default privileges in schema support_organizations_organization_roles revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_organization_roles grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_organization_policies from public, anon, authenticated, service_role;
grant usage on schema support_organizations_organization_policies to support_web_runtime;
revoke all on all tables in schema support_organizations_organization_policies from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_organization_policies to support_web_runtime;
alter default privileges in schema support_organizations_organization_policies revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_organization_policies grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_organizations_custom_properties from public, anon, authenticated, service_role;
grant usage on schema support_organizations_custom_properties to support_web_runtime;
revoke all on all tables in schema support_organizations_custom_properties from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_organizations_custom_properties to support_web_runtime;
alter default privileges in schema support_organizations_custom_properties revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_organizations_custom_properties grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_repositories_repositories from public, anon, authenticated, service_role;
grant usage on schema support_repositories_repositories to support_web_runtime;
revoke all on all tables in schema support_repositories_repositories from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_repositories_repositories to support_web_runtime;
alter default privileges in schema support_repositories_repositories revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_repositories_repositories grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_repositories_repository_access from public, anon, authenticated, service_role;
grant usage on schema support_repositories_repository_access to support_web_runtime;
revoke all on all tables in schema support_repositories_repository_access from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_repositories_repository_access to support_web_runtime;
alter default privileges in schema support_repositories_repository_access revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_repositories_repository_access grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_collaboration_conversations from public, anon, authenticated, service_role;
grant usage on schema support_collaboration_conversations to support_web_runtime;
revoke all on all tables in schema support_collaboration_conversations from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_collaboration_conversations to support_web_runtime;
alter default privileges in schema support_collaboration_conversations revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_collaboration_conversations grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_collaboration_discussions from public, anon, authenticated, service_role;
grant usage on schema support_collaboration_discussions to support_web_runtime;
revoke all on all tables in schema support_collaboration_discussions from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_collaboration_discussions to support_web_runtime;
alter default privileges in schema support_collaboration_discussions revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_collaboration_discussions grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_collaboration_issues from public, anon, authenticated, service_role;
grant usage on schema support_collaboration_issues to support_web_runtime;
revoke all on all tables in schema support_collaboration_issues from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_collaboration_issues to support_web_runtime;
alter default privileges in schema support_collaboration_issues revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_collaboration_issues grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_collaboration_moderation from public, anon, authenticated, service_role;
grant usage on schema support_collaboration_moderation to support_web_runtime;
revoke all on all tables in schema support_collaboration_moderation from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_collaboration_moderation to support_web_runtime;
alter default privileges in schema support_collaboration_moderation revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_collaboration_moderation grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_collaboration_projects from public, anon, authenticated, service_role;
grant usage on schema support_collaboration_projects to support_web_runtime;
revoke all on all tables in schema support_collaboration_projects from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_collaboration_projects to support_web_runtime;
alter default privileges in schema support_collaboration_projects revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_collaboration_projects grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_engagement_notifications from public, anon, authenticated, service_role;
grant usage on schema support_engagement_notifications to support_web_runtime;
revoke all on all tables in schema support_engagement_notifications from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_engagement_notifications to support_web_runtime;
alter default privileges in schema support_engagement_notifications revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_engagement_notifications grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_engagement_stars from public, anon, authenticated, service_role;
grant usage on schema support_engagement_stars to support_web_runtime;
revoke all on all tables in schema support_engagement_stars from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_engagement_stars to support_web_runtime;
alter default privileges in schema support_engagement_stars revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_engagement_stars grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_engagement_subscriptions from public, anon, authenticated, service_role;
grant usage on schema support_engagement_subscriptions to support_web_runtime;
revoke all on all tables in schema support_engagement_subscriptions from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_engagement_subscriptions to support_web_runtime;
alter default privileges in schema support_engagement_subscriptions revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_engagement_subscriptions grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_audit_storage from public, anon, authenticated, service_role;
grant usage on schema support_platform_audit_storage to support_web_runtime;
revoke all on all tables in schema support_platform_audit_storage from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_audit_storage to support_web_runtime;
alter default privileges in schema support_platform_audit_storage revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_audit_storage grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_event_publication from public, anon, authenticated, service_role;
grant usage on schema support_platform_event_publication to support_web_runtime;
revoke all on all tables in schema support_platform_event_publication from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_event_publication to support_web_runtime;
alter default privileges in schema support_platform_event_publication revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_event_publication grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_notification_channels from public, anon, authenticated, service_role;
grant usage on schema support_platform_notification_channels to support_web_runtime;
revoke all on all tables in schema support_platform_notification_channels from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_notification_channels to support_web_runtime;
alter default privileges in schema support_platform_notification_channels revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_notification_channels grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_scheduled_commands from public, anon, authenticated, service_role;
grant usage on schema support_platform_scheduled_commands to support_web_runtime;
revoke all on all tables in schema support_platform_scheduled_commands from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_scheduled_commands to support_web_runtime;
alter default privileges in schema support_platform_scheduled_commands revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_scheduled_commands grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_media_storage from public, anon, authenticated, service_role;
grant usage on schema support_platform_media_storage to support_web_runtime;
revoke all on all tables in schema support_platform_media_storage from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_media_storage to support_web_runtime;
alter default privileges in schema support_platform_media_storage revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_media_storage grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_platform_search_index from public, anon, authenticated, service_role;
grant usage on schema support_platform_search_index to support_web_runtime;
revoke all on all tables in schema support_platform_search_index from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_platform_search_index to support_web_runtime;
alter default privileges in schema support_platform_search_index revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_platform_search_index grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_projections_dashboard from public, anon, authenticated, service_role;
grant usage on schema support_projections_dashboard to support_web_runtime;
revoke all on all tables in schema support_projections_dashboard from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_projections_dashboard to support_web_runtime;
alter default privileges in schema support_projections_dashboard revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_projections_dashboard grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_projections_activity_feed from public, anon, authenticated, service_role;
grant usage on schema support_projections_activity_feed to support_web_runtime;
revoke all on all tables in schema support_projections_activity_feed from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_projections_activity_feed to support_web_runtime;
alter default privileges in schema support_projections_activity_feed revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_projections_activity_feed grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_projections_discovery from public, anon, authenticated, service_role;
grant usage on schema support_projections_discovery to support_web_runtime;
revoke all on all tables in schema support_projections_discovery from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_projections_discovery to support_web_runtime;
alter default privileges in schema support_projections_discovery revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_projections_discovery grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_identity_account_registration from public, anon, authenticated, service_role;
grant usage on schema support_identity_account_registration to support_web_runtime;
revoke all on all tables in schema support_identity_account_registration from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_identity_account_registration to support_web_runtime;
alter default privileges in schema support_identity_account_registration revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_identity_account_registration grant select, insert, update, delete on tables to support_web_runtime;
revoke all on schema support_projections_search from public, anon, authenticated, service_role;
grant usage on schema support_projections_search to support_web_runtime;
revoke all on all tables in schema support_projections_search from public, anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema support_projections_search to support_web_runtime;
alter default privileges in schema support_projections_search revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema support_projections_search grant select, insert, update, delete on tables to support_web_runtime;

do $$
declare
  relation record;
  policy_name text;
begin
  for relation in
    select schemaname, tablename
    from pg_tables
    where schemaname like 'support\_%' escape '\'
      and schemaname <> 'support_private'
  loop
    execute format('alter table %I.%I enable row level security', relation.schemaname, relation.tablename);
    execute format('alter table %I.%I force row level security', relation.schemaname, relation.tablename);
    policy_name := 'support_web_runtime_only';
    execute format('drop policy if exists %I on %I.%I', policy_name, relation.schemaname, relation.tablename);
    execute format(
      'create policy %I on %I.%I for all to support_web_runtime using (current_user = %L) with check (current_user = %L)',
      policy_name, relation.schemaname, relation.tablename, 'support_web_runtime', 'support_web_runtime'
    );
  end loop;
end
$$;

revoke all on function support_private.provision_supabase_user() from public, anon, authenticated, service_role;
revoke all on function support_private.sync_supabase_user_email() from public, anon, authenticated, service_role;
revoke all on function support_private.protect_last_organization_owner() from public, anon, authenticated, service_role;

insert into support_private.schema_contract (
  contract_name,
  contract_version,
  applied_at
)
values ('support-web', '2026-08-01.v1', now())
on conflict (contract_name) do update
set
  contract_version = excluded.contract_version,
  applied_at = excluded.applied_at;

commit;
