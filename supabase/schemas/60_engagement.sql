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
      create index if not exists support_notifications_repository_fk_idx
        on support_notifications (repository_id);

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
