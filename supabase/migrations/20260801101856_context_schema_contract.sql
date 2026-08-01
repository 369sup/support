begin;

-- Forward exception DB-EX-001. See docs/architecture/data-model/migration-exceptions.md.

-- Declarative source: supabase/schemas/00_infrastructure.sql
-- Private infrastructure and bounded-context namespaces.
create schema if not exists support_private;
create schema if not exists support_identity_accounts;
create schema if not exists support_identity_account_emails;
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

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'support_web_runtime') then
    create role support_web_runtime nologin nosuperuser nocreatedb nocreaterole noinherit noreplication nobypassrls;
  end if;
end
$$;


-- Declarative source: supabase/schemas/90_namespaces_and_contract.sql
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


-- Declarative source: supabase/schemas/95_auth_and_storage.sql
-- Auth trigger functions are private, schema-qualified, and deny PUBLIC execution.
-- Historical origin: identity-authentication-supabase-0002
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
        support_account_id text;
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


-- Declarative source: supabase/schemas/99_security.sql
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


insert into support_private.schema_contract (contract_name, contract_version, applied_at)
values ('support-web', '2026-08-01.v1', now())
on conflict (contract_name) do update
set contract_version = excluded.contract_version, applied_at = excluded.applied_at;

commit;
