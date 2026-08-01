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
      create index if not exists support_conversation_comments_author_fk_idx
        on support_conversation_comments (author_account_id);

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
      create index if not exists support_repository_discussions_author_fk_idx
        on support_repository_discussions (author_account_id);

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
      create index if not exists support_repository_issues_author_fk_idx
        on support_repository_issues (author_account_id);

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
