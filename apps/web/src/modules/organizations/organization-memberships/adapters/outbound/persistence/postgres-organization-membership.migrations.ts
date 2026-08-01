import type { PostgresMigration } from "@support/database/postgres";

export const postgresOrganizationMembershipMigrations: readonly PostgresMigration[] =
  [
    {
      id: "zz030_organizations_organization_memberships",
      sql: `
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
      `,
    },
  ];
