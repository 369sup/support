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
