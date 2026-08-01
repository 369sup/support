import "server-only";

import {
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { ChannelDeliveryRepositoryPort } from "../../../application/ports/outbound/channel-delivery.repository.port";
import type {
  ChannelDelivery,
  ChannelDeliveryState,
} from "../../../domain/channel-delivery";

type ChannelDeliveryRow = SqlRow & {
  attempt_count: number;
  channel: "email";
  created_at: string;
  delivery_id: string;
  failure_code: string | null;
  idempotency_key: string;
  provider_reference: string | null;
  recipient: string;
  state: ChannelDeliveryState;
  updated_at: string;
};

function mapRow(row: ChannelDeliveryRow): ChannelDelivery {
  return {
    attemptCount: row.attempt_count,
    channel: row.channel,
    createdAt: row.created_at,
    deliveryId: row.delivery_id,
    failureCode: row.failure_code,
    idempotencyKey: row.idempotency_key,
    providerReference: row.provider_reference,
    recipient: row.recipient,
    state: row.state,
    updatedAt: row.updated_at,
  };
}

const returningColumns = `
  attempt_count,
  channel,
  created_at::text as created_at,
  delivery_id,
  failure_code,
  idempotency_key,
  provider_reference,
  recipient,
  state,
  updated_at::text as updated_at
`;

export class PostgresChannelDeliveryAdapter
  implements ChannelDeliveryRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findById(
    deliveryId: string,
  ): Promise<ChannelDelivery | null> {
    const result = await this.database.query<ChannelDeliveryRow>(
      `
        select ${returningColumns}
        from support_platform_notification_channels.support_channel_deliveries
        where delivery_id = $1
      `,
      [deliveryId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapRow(row);
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<ChannelDelivery | null> {
    const result = await this.database.query<ChannelDeliveryRow>(
      `
        select ${returningColumns}
        from support_platform_notification_channels.support_channel_deliveries
        where idempotency_key = $1
      `,
      [idempotencyKey],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapRow(row);
  }

  async save(delivery: ChannelDelivery): Promise<void> {
    await this.database.query(
      `
        insert into support_platform_notification_channels.support_channel_deliveries (
          delivery_id, idempotency_key, channel, recipient, state,
          attempt_count, provider_reference, failure_code,
          created_at, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        on conflict (delivery_id) do update
        set state = excluded.state,
            attempt_count = excluded.attempt_count,
            provider_reference = excluded.provider_reference,
            failure_code = excluded.failure_code,
            updated_at = excluded.updated_at
      `,
      [
        delivery.deliveryId,
        delivery.idempotencyKey,
        delivery.channel,
        delivery.recipient,
        delivery.state,
        delivery.attemptCount,
        delivery.providerReference,
        delivery.failureCode,
        delivery.createdAt,
        delivery.updatedAt,
      ],
    );
  }
}
