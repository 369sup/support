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
      create index if not exists support_organization_team_memberships_organization_fk_idx
        on support_organization_team_memberships (organization_id);
      create index if not exists support_organization_team_maintainers_organization_fk_idx
        on support_organization_team_maintainers (organization_id);

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
