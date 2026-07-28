import "server-only";

import {
  runPostgresMigrations,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";
import { z } from "zod";

import type { PublicationStateRepositoryPort } from "../../../application/ports/outbound/publication-state.repository.port";
import type {
  DeadLetterRecord,
  PublicationAttempt,
  PublicationReceipt,
} from "../../../domain/publication-record";
import { postgresEventPublicationMigrations } from "./postgres-event-publication.migrations";

const deadLetterSchema = z.object({
  deadLetterId: z.string(),
  envelope: z.object({
    aggregateId: z.string(),
    aggregateVersion: z.number().int().nonnegative(),
    eventId: z.string(),
    eventName: z.string(),
    eventVersion: z.number().int().positive(),
    occurredAt: z.string(),
    orderingKey: z.string(),
    payload: z.unknown(),
    sourceContext: z.string(),
  }),
  failedAt: z.string(),
  failureCount: z.number().int().positive(),
  lastErrorCode: z.string(),
  version: z.number().int().positive(),
});

type CountRow = SqlRow & {
  attempts: string;
  dead_letters: string;
  delivered_attempts: string;
  failed_attempts: string;
  receipts: string;
};
type DeadLetterRow = SqlRow & { record: unknown };
type FailureCountRow = SqlRow & { failure_count: string };
type ReceiptRow = SqlRow & { found: number };

function parseDeadLetter(value: unknown): DeadLetterRecord {
  return deadLetterSchema.parse(value);
}

export class PostgresPublicationStateAdapter
  implements PublicationStateRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = runPostgresMigrations(
      database,
      postgresEventPublicationMigrations,
    );
  }

  async findDeadLetter(
    deadLetterId: string,
  ): Promise<DeadLetterRecord | null> {
    await this.ready;
    const result = await this.database.query<DeadLetterRow>(
      `
        select record
        from support_event_publication_dead_letters
        where dead_letter_id = $1
      `,
      [deadLetterId],
    );
    const row = result.rows[0];
    return row === undefined ? null : parseDeadLetter(row.record);
  }

  async getFailureCount(eventId: string): Promise<number> {
    await this.ready;
    const result = await this.database.query<FailureCountRow>(
      `
        select count(*)::text as failure_count
        from support_event_publication_attempts
        where event_id = $1 and outcome = 'failed'
      `,
      [eventId],
    );
    return Number(result.rows[0]?.failure_count ?? 0);
  }

  async getCounts() {
    await this.ready;
    const result = await this.database.query<CountRow>(`
      select
        (select count(*) from support_event_publication_attempts)::text
          as attempts,
        (select count(*) from support_event_publication_dead_letters)::text
          as dead_letters,
        (select count(*) from support_event_publication_attempts
          where outcome = 'delivered')::text as delivered_attempts,
        (select count(*) from support_event_publication_attempts
          where outcome = 'failed')::text as failed_attempts,
        (select count(*) from support_event_publication_receipts)::text
          as receipts
    `);
    const row = result.rows[0];
    return {
      attempts: Number(row?.attempts ?? 0),
      deadLetters: Number(row?.dead_letters ?? 0),
      deliveredAttempts: Number(row?.delivered_attempts ?? 0),
      failedAttempts: Number(row?.failed_attempts ?? 0),
      receipts: Number(row?.receipts ?? 0),
    };
  }

  async hasReceipt(eventId: string): Promise<boolean> {
    await this.ready;
    const result = await this.database.query<ReceiptRow>(
      `
        select 1 as found
        from support_event_publication_receipts
        where event_id = $1
      `,
      [eventId],
    );
    return result.rows.length > 0;
  }

  async listDeadLetters(
    sourceContext?: string,
  ): Promise<readonly DeadLetterRecord[]> {
    await this.ready;
    const result =
      sourceContext === undefined
        ? await this.database.query<DeadLetterRow>(`
            select record
            from support_event_publication_dead_letters
            order by failed_at, dead_letter_id
          `)
        : await this.database.query<DeadLetterRow>(
            `
              select record
              from support_event_publication_dead_letters
              where source_context = $1
              order by failed_at, dead_letter_id
            `,
            [sourceContext],
          );
    return result.rows.map((row) => parseDeadLetter(row.record));
  }

  async recordAttempt(attempt: PublicationAttempt): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_event_publication_attempts (
          attempt_id, attempted_at, error_code, event_id, outcome,
          source_context, version
        ) values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (attempt_id) do nothing
      `,
      [
        attempt.attemptId,
        attempt.attemptedAt,
        attempt.errorCode,
        attempt.eventId,
        attempt.outcome,
        attempt.sourceContext,
        attempt.version,
      ],
    );
  }

  async removeDeadLetter(deadLetterId: string): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        delete from support_event_publication_dead_letters
        where dead_letter_id = $1
      `,
      [deadLetterId],
    );
  }

  async saveDeadLetter(record: DeadLetterRecord): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_event_publication_dead_letters (
          dead_letter_id, event_id, source_context, failed_at, record, version
        ) values ($1, $2, $3, $4, $5::jsonb, $6)
        on conflict (dead_letter_id) do update
        set failed_at = excluded.failed_at,
            record = excluded.record,
            version = excluded.version
      `,
      [
        record.deadLetterId,
        record.envelope.eventId,
        record.envelope.sourceContext,
        record.failedAt,
        JSON.stringify(record),
        record.version,
      ],
    );
  }

  async saveReceipt(receipt: PublicationReceipt): Promise<void> {
    await this.ready;
    await this.database.query(
      `
        insert into support_event_publication_receipts (
          event_id, delivered_at, version
        ) values ($1, $2, $3)
        on conflict (event_id) do nothing
      `,
      [receipt.eventId, receipt.deliveredAt, receipt.version],
    );
  }
}
