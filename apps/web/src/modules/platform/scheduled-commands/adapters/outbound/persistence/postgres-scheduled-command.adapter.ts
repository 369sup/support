import "server-only";

import {
  assertPostgresMigrationsApplied,
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type {
  LeaseMutationResult,
  SaveScheduledCommandResult,
  ScheduledCommandRepositoryPort,
} from "../../../application/ports/outbound/scheduled-command.repository.port";
import type {
  ScheduledCommand,
  ScheduledCommandState,
} from "../../../domain/scheduled-command";
import { postgresScheduledCommandMigrations } from "./postgres-scheduled-command.migrations";

type ScheduledCommandRow = SqlRow & {
  attempt_count: number;
  command_id: string;
  command_name: string;
  due_at: string;
  last_error_code: string | null;
  lease_until: string | null;
  max_attempts: number;
  owner_context: string;
  payload: unknown;
  state: ScheduledCommandState;
  version: number;
  worker_id: string | null;
};

function mapRow(row: ScheduledCommandRow): ScheduledCommand {
  return {
    attemptCount: row.attempt_count,
    commandId: row.command_id,
    commandName: row.command_name,
    dueAt: row.due_at,
    lastErrorCode: row.last_error_code,
    leaseUntil: row.lease_until,
    maxAttempts: row.max_attempts,
    ownerContext: row.owner_context,
    payload: row.payload,
    state: row.state,
    version: row.version,
    workerId: row.worker_id,
  };
}

const returningColumns = `
  attempt_count, command_id, command_name, due_at::text as due_at,
  last_error_code, lease_until::text as lease_until, max_attempts,
  owner_context, payload, state, version, worker_id
`;

export class PostgresScheduledCommandAdapter
  implements ScheduledCommandRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = assertPostgresMigrationsApplied(
      database,
      postgresScheduledCommandMigrations,
    );
  }

  async claimDue(input: {
    claimedAt: string;
    leaseUntil: string;
    limit: number;
    workerId: string;
  }): Promise<readonly ScheduledCommand[]> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const result = await connection.query<ScheduledCommandRow>(
        `
          with candidates as (
            select command_id
            from support_scheduled_commands
            where state = 'pending' and due_at <= $1
            order by due_at, command_id
            limit $2
            for update skip locked
          )
          update support_scheduled_commands as command
          set state = 'leased',
              worker_id = $3,
              lease_until = $4,
              attempt_count = command.attempt_count + 1,
              version = command.version + 1
          from candidates
          where command.command_id = candidates.command_id
          returning ${returningColumns}
        `,
        [input.claimedAt, input.limit, input.workerId, input.leaseUntil],
      );
      return result.rows.map(mapRow);
    });
  }

  async complete(input: {
    commandId: string;
    expectedVersion: number;
    workerId: string;
  }): Promise<LeaseMutationResult> {
    await this.ready;
    const result = await this.database.query<ScheduledCommandRow>(
      `
        update support_scheduled_commands
        set state = 'completed',
            worker_id = null,
            lease_until = null,
            version = version + 1
        where command_id = $1
          and state = 'leased'
          and worker_id = $2
          and version = $3
        returning ${returningColumns}
      `,
      [input.commandId, input.workerId, input.expectedVersion],
    );
    const row = result.rows[0];
    return row === undefined
      ? this.resolveMutationFailure(this.database, input)
      : { status: "updated", command: mapRow(row) };
  }

  async fail(input: {
    commandId: string;
    errorCode: string;
    expectedVersion: number;
    retryAt: string;
    workerId: string;
  }): Promise<LeaseMutationResult> {
    await this.ready;
    const result = await this.database.query<ScheduledCommandRow>(
      `
        update support_scheduled_commands
        set state = case
              when attempt_count >= max_attempts
                then 'dead-lettered'
              else 'pending'
            end,
            due_at = $4,
            last_error_code = $5,
            worker_id = null,
            lease_until = null,
            version = version + 1
        where command_id = $1
          and state = 'leased'
          and worker_id = $2
          and version = $3
        returning ${returningColumns}
      `,
      [
        input.commandId,
        input.workerId,
        input.expectedVersion,
        input.retryAt,
        input.errorCode,
      ],
    );
    const row = result.rows[0];
    return row === undefined
      ? this.resolveMutationFailure(this.database, input)
      : { status: "updated", command: mapRow(row) };
  }

  async reconcileExpired(input: {
    limit: number;
    now: string;
  }): Promise<Readonly<{ deadLettered: number; reset: number }>> {
    await this.ready;
    return this.database.transaction(async (connection) => {
      const result = await connection.query<ScheduledCommandRow>(
        `
          with candidates as (
            select command_id
            from support_scheduled_commands
            where state = 'leased' and lease_until <= $1
            order by lease_until, command_id
            limit $2
            for update skip locked
          )
          update support_scheduled_commands as command
          set state = case
                when command.attempt_count >= command.max_attempts
                  then 'dead-lettered'
                else 'pending'
              end,
              worker_id = null,
              lease_until = null,
              version = command.version + 1
          from candidates
          where command.command_id = candidates.command_id
          returning ${returningColumns}
        `,
        [input.now, input.limit],
      );
      return {
        deadLettered: result.rows.filter(
          (row) => row.state === "dead-lettered",
        ).length,
        reset: result.rows.filter((row) => row.state === "pending").length,
      };
    });
  }

  async save(
    command: ScheduledCommand,
  ): Promise<SaveScheduledCommandResult> {
    await this.ready;
    const result = await this.database.query<ScheduledCommandRow>(
      `
        insert into support_scheduled_commands (
          command_id, owner_context, command_name, payload, due_at, state,
          attempt_count, max_attempts, worker_id, lease_until,
          last_error_code, version
        ) values (
          $1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12
        )
        on conflict (command_id) do nothing
        returning ${returningColumns}
      `,
      [
        command.commandId,
        command.ownerContext,
        command.commandName,
        JSON.stringify(command.payload),
        command.dueAt,
        command.state,
        command.attemptCount,
        command.maxAttempts,
        command.workerId,
        command.leaseUntil,
        command.lastErrorCode,
        command.version,
      ],
    );
    const inserted = result.rows[0];
    if (inserted !== undefined) {
      return { status: "inserted", command: mapRow(inserted) };
    }
    const existing = await this.findById(this.database, command.commandId);
    if (existing === null) {
      throw new Error("Scheduled command disappeared after insert conflict.");
    }
    return { status: "existing", command: existing };
  }

  private async findById(
    connection: SqlExecutor,
    commandId: string,
  ): Promise<ScheduledCommand | null> {
    const result = await connection.query<ScheduledCommandRow>(
      `
        select ${returningColumns}
        from support_scheduled_commands
        where command_id = $1
      `,
      [commandId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapRow(row);
  }

  private async resolveMutationFailure(
    connection: SqlExecutor,
    input: {
      commandId: string;
      expectedVersion: number;
      workerId: string;
    },
  ): Promise<LeaseMutationResult> {
    const current = await this.findById(connection, input.commandId);
    if (current === null) {
      return { status: "command-not-found" };
    }
    if (current.version !== input.expectedVersion) {
      return { status: "version-conflict" };
    }
    return { status: "lease-mismatch" };
  }
}
