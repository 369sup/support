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
