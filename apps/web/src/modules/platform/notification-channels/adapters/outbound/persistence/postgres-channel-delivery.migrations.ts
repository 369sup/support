import type { PostgresMigration } from "@support/database/postgres";

export const postgresChannelDeliveryMigrations: readonly PostgresMigration[] =
  [
    {
      id: "platform-notification-channels-0001",
      sql: `
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
      `,
    },
  ];
