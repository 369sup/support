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
        create index if not exists support_dashboard_selections_account_fk_idx
          on support_dashboard_selections (account_id);
        create index if not exists support_dashboard_selections_organization_fk_idx
          on support_dashboard_selections (organization_id);

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
