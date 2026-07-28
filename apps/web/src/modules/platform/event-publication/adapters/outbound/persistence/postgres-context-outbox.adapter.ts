import "server-only";

import {
  runPostgresMigrations,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";
import { z } from "zod";

import type { CommittedEventSourcePort } from "../../../application/ports/outbound/committed-event-source.port";
import type { PublicationClockPort } from "../../../application/ports/outbound/publication-clock.port";
import type { PublicationIdGeneratorPort } from "../../../application/ports/outbound/publication-id-generator.port";
import type {
  DomainEventEnvelope,
  RecordDomainEventInput,
} from "../../../contracts/domain-event-envelope";
import type { EventRecorderPort } from "../../../contracts/event-recorder";
import type { PublicationEventEnvelope } from "../../../domain/publication-record";
import { postgresEventPublicationMigrations } from "./postgres-event-publication.migrations";

const leaseDurationMilliseconds = 60_000;

const envelopeSchema = z.object({
  aggregateId: z.string(),
  aggregateVersion: z.number().int().nonnegative(),
  eventId: z.string(),
  eventName: z.string(),
  eventVersion: z.number().int().positive(),
  occurredAt: z.string(),
  orderingKey: z.string(),
  payload: z.unknown(),
  sourceContext: z.string(),
});

type EnvelopeRow = SqlRow & { envelope: unknown };
type OldestRow = SqlRow & { occurred_at: string | null };

function parseEnvelope(value: unknown): PublicationEventEnvelope {
  return envelopeSchema.parse(value);
}

export class PostgresContextOutboxAdapter
  implements EventRecorderPort, CommittedEventSourcePort
{
  readonly sourceId: string;
  private readonly database: TransactionalSqlExecutor;
  private readonly idGenerator: PublicationIdGeneratorPort;
  private readonly clock: PublicationClockPort;
  private readonly ready: Promise<void>;

  constructor(
    sourceId: string,
    database: TransactionalSqlExecutor,
    idGenerator: PublicationIdGeneratorPort,
    clock: PublicationClockPort,
  ) {
    this.sourceId = sourceId;
    this.database = database;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.ready = runPostgresMigrations(
      database,
      postgresEventPublicationMigrations,
    );
  }

  async record<Payload>(
    input: RecordDomainEventInput<Payload>,
  ): Promise<DomainEventEnvelope<Payload>> {
    await this.ready;
    const envelope: DomainEventEnvelope<Payload> = {
      ...input,
      eventId: this.idGenerator.nextEventId(),
      occurredAt: this.clock.now(),
      sourceContext: this.sourceId,
    };
    await this.database.query(
      `
        insert into support_event_outbox (
          event_id, source_id, occurred_at, envelope, state, version
        ) values ($1, $2, $3, $4::jsonb, 'pending', 1)
      `,
      [
        envelope.eventId,
        this.sourceId,
        envelope.occurredAt,
        JSON.stringify(envelope),
      ],
    );
    return envelope;
  }

  async acknowledge(eventId: string): Promise<void> {
    await this.ready;
    await this.database.query(
      "delete from support_event_outbox where event_id = $1 and source_id = $2",
      [eventId, this.sourceId],
    );
  }

  async claimPending(input: {
    claimedAt: string;
    limit: number;
  }): Promise<readonly PublicationEventEnvelope[]> {
    await this.ready;
    const leaseUntil = new Date(
      Date.parse(input.claimedAt) + leaseDurationMilliseconds,
    ).toISOString();
    return this.database.transaction(async (connection) => {
      const result = await connection.query<EnvelopeRow>(
        `
          with candidates as (
            select event_id
            from support_event_outbox
            where source_id = $1
              and (
                state = 'pending'
                or (state = 'leased' and lease_until <= $2)
              )
            order by occurred_at, event_id
            limit $3
            for update skip locked
          )
          update support_event_outbox as outbox
          set state = 'leased',
              lease_until = $4,
              version = outbox.version + 1
          from candidates
          where outbox.event_id = candidates.event_id
          returning outbox.envelope
        `,
        [this.sourceId, input.claimedAt, input.limit, leaseUntil],
      );
      return result.rows.map((row) => parseEnvelope(row.envelope));
    });
  }

  async deadLetter(eventId: string): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        update support_event_outbox
        set state = 'dead-lettered',
            lease_until = null,
            version = version + 1
        where event_id = $1 and source_id = $2
      `,
      [eventId, this.sourceId],
    );
  }

  async getOldestPendingOccurredAt(): Promise<string | null> {
    await this.ready;
    const result = await this.database.query<OldestRow>(
      `
        select min(occurred_at)::text as occurred_at
        from support_event_outbox
        where source_id = $1 and state = 'pending'
      `,
      [this.sourceId],
    );
    return result.rows[0]?.occurred_at ?? null;
  }

  async release(eventId: string): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        update support_event_outbox
        set state = 'pending',
            lease_until = null,
            version = version + 1
        where event_id = $1 and source_id = $2 and state = 'leased'
      `,
      [eventId, this.sourceId],
    );
  }
}
