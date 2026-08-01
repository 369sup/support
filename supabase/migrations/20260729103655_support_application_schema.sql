begin;

create table if not exists public.support_schema_migrations (
  migration_id text primary key,
  checksum text not null,
  applied_at timestamptz not null default now()
);
alter table public.support_schema_migrations enable row level security;

-- Support migration: identity-accounts-0001
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-accounts-0001', 'f3c4ddb21011c726578e82d6efd3a6b88de10935ce50ab0159d8be43a7c10171')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: identity-account-emails-0001
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-account-emails-0001', '31d06c02cf9c965f2a6f30270ecdec1ae123b6c739fd756d29f5ed3dfa8fe50f')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: identity-account-emails-0002-rls
alter table support_account_emails enable row level security;
        alter table support_released_account_emails
          enable row level security;
        alter table support_email_verifications enable row level security;
        alter table support_organization_notification_routes
          enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-account-emails-0002-rls', '8fbe0a8774c390384f8306f29abecd9a60eed85832ee852060b8e1e74604dd70')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: identity-authentication-supabase-0001
create table if not exists support_auth_identities (
        provider text not null check (provider = 'supabase'),
        subject text not null,
        account_id text not null references support_accounts(account_id),
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
        support_account_id text := gen_random_uuid()::text;
        support_email_id text := gen_random_uuid()::text;
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('identity-authentication-supabase-0001', '702b18b8ee4e0175c33b8b44512f4f65fb21d4892c27ce026f755a83b0446e9f')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz010_organizations_organizations
create table if not exists support_organizations (
        organization_id text primary key,
        login text not null,
        normalized_login text not null unique,
        display_name text not null,
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      alter table support_organizations enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz010_organizations_organizations', '8451faf98d8fe7ec940afdfb6176e4908400b4493a0eb12474c43fc92036d2b1')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz020_enterprises_enterprises
create table if not exists support_enterprises (
        enterprise_id text primary key,
        slug text not null,
        normalized_slug text not null unique,
        display_name text not null,
        enterprise_type text not null check (enterprise_type in ('standard', 'managed-users')),
        lifecycle_state text not null check (lifecycle_state in ('active', 'suspended', 'deleted')),
        created_at timestamptz not null default now()
      );

      create table if not exists support_enterprise_organizations (
        enterprise_id text not null references support_enterprises(enterprise_id),
        organization_id text not null references support_organizations(organization_id),
        attached_at timestamptz not null default now(),
        primary key (enterprise_id, organization_id),
        unique (organization_id)
      );

      create table if not exists support_enterprise_memberships (
        membership_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        affiliation text not null check (affiliation in ('direct', 'organization-derived')),
        state text not null check (state in ('active', 'pending', 'suspended', 'removed')),
        unique (enterprise_id, account_id)
      );

      create table if not exists support_enterprise_role_assignments (
        assignment_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        role_name text not null check (role_name in ('enterprise-owner', 'enterprise-admin')),
        permissions text[] not null,
        unique (enterprise_id, account_id, role_name)
      );

      alter table support_enterprises enable row level security;
      alter table support_enterprise_organizations enable row level security;
      alter table support_enterprise_memberships enable row level security;
      alter table support_enterprise_role_assignments enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz020_enterprises_enterprises', '1daa750236468aa6d5c1226ea0457a01ccf6f6aa455bc148115ad9f5db71fed7')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz030_organizations_organization_memberships
create table if not exists support_organization_memberships (
          membership_id text primary key,
          organization_id text not null references support_organizations(organization_id),
          account_id text not null references support_accounts(account_id),
          role text not null check (role in ('member', 'owner')),
          state text not null check (state in ('active', 'pending', 'suspended', 'removed')),
          source text not null check (source in ('direct', 'enterprise-managed', 'identity-provider-group')),
          unique (organization_id, account_id)
        );

        create table if not exists support_organization_invitations (
          invitation_id text primary key,
          membership_id text not null references support_organization_memberships(membership_id),
          organization_id text not null references support_organizations(organization_id),
          account_id text not null references support_accounts(account_id),
          inviter_account_id text not null references support_accounts(account_id),
          role text not null check (role in ('member', 'owner')),
          state text not null check (state in ('pending', 'accepted', 'declined', 'canceled', 'expired')),
          created_at timestamptz not null,
          expires_at timestamptz not null,
          decided_at timestamptz
        );

        create table if not exists support_enterprise_team_membership_assignments (
          assignment_id text not null,
          membership_id text not null references support_organization_memberships(membership_id),
          primary key (assignment_id, membership_id)
        );

        create index if not exists support_org_memberships_account_idx
          on support_organization_memberships (account_id, organization_id);
        create index if not exists support_org_invitations_account_idx
          on support_organization_invitations (account_id, created_at desc);
        create index if not exists support_org_invitations_org_idx
          on support_organization_invitations (organization_id, created_at desc);

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

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz030_organizations_organization_memberships', '6a1b030aca68597520ad6cfbdf91345eba80c963432b9708e6dcbcc0340bb440')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz040_organizations_organization_teams
create table if not exists support_organization_teams (
        team_id text primary key,
        organization_id text not null,
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        visibility text not null check (visibility in ('visible', 'secret')),
        parent_team_id text references support_organization_teams(team_id),
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (organization_id, normalized_slug),
        check (visibility = 'visible' or parent_team_id is null)
      );

      create table if not exists support_organization_team_memberships (
        team_membership_id text primary key,
        team_id text not null references support_organization_teams(team_id),
        organization_id text not null,
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_organization_team_maintainers (
        team_maintainer_id text primary key,
        team_id text not null references support_organization_teams(team_id),
        organization_id text not null,
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, account_id)
      );

      create index if not exists support_team_memberships_account_org_idx
        on support_organization_team_memberships (account_id, organization_id)
        where state = 'active';

      alter table support_organization_teams enable row level security;
      alter table support_organization_team_memberships enable row level security;
      alter table support_organization_team_maintainers enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz040_organizations_organization_teams', '6b20bf49d954d8c1ac33643383bb21e02044bfcde7a5ae893c9b3ea86d1f5725')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz045_enterprises_enterprise_teams
create table if not exists support_enterprise_teams (
        team_id text primary key,
        enterprise_id text not null references support_enterprises(enterprise_id),
        name text not null,
        slug text not null,
        normalized_slug text not null,
        description text not null default '',
        lifecycle_state text not null check (lifecycle_state in ('active', 'deleted')),
        unique (enterprise_id, normalized_slug)
      );

      create table if not exists support_enterprise_team_memberships (
        team_membership_id text primary key,
        team_id text not null references support_enterprise_teams(team_id),
        enterprise_id text not null references support_enterprises(enterprise_id),
        account_id text not null references support_accounts(account_id),
        state text not null check (state in ('active', 'removed')),
        unique (team_id, account_id)
      );

      create table if not exists support_enterprise_team_organization_grants (
        grant_id text primary key,
        team_id text not null references support_enterprise_teams(team_id),
        enterprise_id text not null references support_enterprises(enterprise_id),
        organization_id text not null references support_organizations(organization_id),
        state text not null check (state in ('active', 'revoked')),
        unique (team_id, organization_id)
      );

      create index if not exists support_enterprise_team_memberships_team_state_idx
        on support_enterprise_team_memberships (team_id, state);
      create index if not exists support_enterprise_team_org_grants_team_state_idx
        on support_enterprise_team_organization_grants (team_id, state);

      alter table support_enterprise_teams enable row level security;
      alter table support_enterprise_team_memberships enable row level security;
      alter table support_enterprise_team_organization_grants enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz045_enterprises_enterprise_teams', '80389d3b1c6d734dcb01728bfacbbae0f38ce0e0ebefcec9e4918e4874ababf9')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz046_organizations_organization_roles
create table if not exists support_organization_role_assignments (
          assignment_id text primary key,
          organization_id text not null references support_organizations(organization_id),
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
          subject_id text not null,
          state text not null check (state in ('active', 'revoked')),
          unique (organization_id, subject_kind, subject_id, role_key)
        );

        create index if not exists support_org_role_assignments_org_state_idx
          on support_organization_role_assignments (organization_id, state);

        alter table support_organization_role_assignments enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz046_organizations_organization_roles', '2dcf547caf368f7d61040fc9b71b49f0e9db805d040df822c9c852d9cd6d2220')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz047_organizations_organization_policies
create table if not exists support_organization_policies (
          organization_id text primary key references support_organizations(organization_id),
          base_repository_permission text check (
            base_repository_permission in ('read', 'triage', 'write', 'maintain', 'admin')
          ),
          outside_collaborator_oauth_allowed boolean not null default true,
          allowed_oauth_scopes text[] not null default '{}',
          outside_collaborator_github_app_allowed boolean not null default true,
          owner_approval_required_for_additional_permissions boolean not null default false
        );

        alter table support_organization_policies enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz047_organizations_organization_policies', '012392cad03a16bd825d79eed4bdd6d1c97ad89fafcb8319d4ba931fcebfb1ca')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz050_repositories_repositories
create table if not exists support_repositories (
        repository_id text primary key,
        owner_kind text not null check (owner_kind in ('personal', 'organization')),
        owner_id text not null,
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz050_repositories_repositories', 'abf5b774c340bff8b5596b5132fa2e700ae1fcca240054eecbd3103c9376e32c')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz060_repositories_repository_access
create table if not exists support_repository_account_grants (
        grant_id text primary key,
        repository_id text not null references support_repositories(repository_id),
        account_id text not null references support_accounts(account_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, account_id)
      );

      create table if not exists support_repository_team_grants (
        grant_id text primary key,
        repository_id text not null references support_repositories(repository_id),
        organization_id text not null,
        team_id text not null references support_organization_teams(team_id),
        permission text not null check (permission in ('read', 'triage', 'write', 'maintain', 'admin')),
        state text not null check (state in ('active', 'revoked')),
        unique (repository_id, team_id)
      );

      alter table support_repository_account_grants enable row level security;
      alter table support_repository_team_grants enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz060_repositories_repository_access', '84a80349544b4d756099fa0d15cc81dbce2846cef23fa63401902578d8be0121')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz070_organizations_custom_properties
create table if not exists support_organization_repository_properties (
        property_id text primary key,
        organization_id text not null references support_organizations(organization_id),
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

      create table if not exists support_repository_property_values (
        repository_id text not null references support_repositories(repository_id),
        property_id text not null references support_organization_repository_properties(property_id),
        value jsonb,
        source text not null check (source in ('explicit', 'default')),
        updated_by_account_id text not null references support_accounts(account_id),
        updated_at timestamptz not null default now(),
        primary key (repository_id, property_id)
      );

      create index if not exists support_repository_property_values_search_idx
        on support_repository_property_values using gin (value);

      alter table support_organization_repository_properties enable row level security;
      alter table support_repository_property_values enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz070_organizations_custom_properties', '7e93f70552b31e3f0d3287486e468a97c79e1a2cf3b4fb10a607f35a16554c15')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280010_platform_audit_storage
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280010_platform_audit_storage', '6c46694cba0b1a29d8d47290a000bb34b86f9044686841a52ae0d9dd8615c5d9')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280011_platform_audit_storage_rls
alter table support_audit_records enable row level security;
      alter table support_audit_exports enable row level security;
      alter table support_audit_retention_executions
        enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280011_platform_audit_storage_rls', '0dcca97773a3ab1342bcfdf46f61ff25e02bf69dcfc516d9ffcc5cebbee4ef74')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280001_platform_event_outbox
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280001_platform_event_outbox', '62334eab533ae27077614096ae20b940507038e28ff0b50b02b085164e01cd49')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280002_platform_event_publication_state
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280002_platform_event_publication_state', '2db9fea477a6ca3a6992da12df272d8c6de828cbc2a4ee6571e3feeee6520a8e')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280003_platform_event_publication_rls
alter table support_event_outbox enable row level security;
        alter table support_event_publication_attempts
          enable row level security;
        alter table support_event_publication_receipts
          enable row level security;
        alter table support_event_publication_dead_letters
          enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280003_platform_event_publication_rls', '1b5e36ffb26ead20834f3db91e7a0a46e4a9f92a02ea6d8d705a1f86f814960e')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: platform-notification-channels-0001
create table if not exists support_channel_deliveries (
          delivery_id text primary key,
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('platform-notification-channels-0001', '0f9f9be522ca1ee162e2d5e42b134c5b2258290a8680b923886c80c038d422fe')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: platform-notification-channels-0002-rls
alter table support_channel_deliveries enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('platform-notification-channels-0002-rls', '70dcfef98617929d1fa1616f25410a1c325eff6e6d96d601a54ffa660ed469d5')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280020_platform_scheduled_commands
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

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280020_platform_scheduled_commands', 'a86fad39974b5ad679b866264177011464814ff831d3d52c06491a26febde0a0')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: 202607280021_platform_scheduled_commands_rls
alter table support_scheduled_commands enable row level security;

insert into public.support_schema_migrations (migration_id, checksum)
values ('202607280021_platform_scheduled_commands_rls', '3e7e8d87dbadb4dedce62e3080b3498eba0bf29816c43d7c39aee6cbb436ca63')
on conflict (migration_id) do update set checksum = excluded.checksum;

-- Support migration: zz999_security_hardening
do $$
        declare
          table_row record;
          policy_row record;
        begin
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
          end loop;

          for policy_row in
            select schemaname, tablename, policyname
              from pg_policies
             where schemaname = 'public'
               and tablename like 'support\_%' escape '\'
          loop
            execute format(
              'drop policy %I on %I.%I',
              policy_row.policyname,
              policy_row.schemaname,
              policy_row.tablename
            );
          end loop;

          if to_regprocedure('public.rls_auto_enable()') is not null then
            revoke execute on function public.rls_auto_enable() from public;
            if exists (select 1 from pg_roles where rolname = 'anon') then
              revoke execute on function public.rls_auto_enable() from anon;
            end if;
            if exists (
              select 1 from pg_roles where rolname = 'authenticated'
            ) then
              revoke execute on function public.rls_auto_enable()
                from authenticated;
            end if;
          end if;
        end
        $$;

insert into public.support_schema_migrations (migration_id, checksum)
values ('zz999_security_hardening', '7a6dc7bf66c717ed64e2226e63ec572c99e9c762687a3749ea1c463ba2dbdd15')
on conflict (migration_id) do update set checksum = excluded.checksum;

commit;
