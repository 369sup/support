import { createHash } from "node:crypto";

import {
  Pool,
  type PoolConfig,
} from "pg";

export type SqlValue =
  | boolean
  | Buffer
  | Date
  | number
  | string
  | null;

export type SqlRow = Readonly<Record<string, unknown>>;

export type SqlQueryResult<Row extends SqlRow> = Readonly<{
  rowCount: number;
  rows: readonly Row[];
}>;

export interface SqlExecutor {
  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>>;
}

export interface TransactionalSqlExecutor extends SqlExecutor {
  transaction<Result>(
    work: (connection: SqlExecutor) => Promise<Result>,
  ): Promise<Result>;
}

export interface PostgresClientPort extends SqlExecutor {
  release(): void;
}

export interface PostgresPoolPort extends SqlExecutor {
  connect(): Promise<PostgresClientPort>;
  end(): Promise<void>;
}

export type PostgresSslMode = "disable" | "require" | "verify-full";

export type PostgresRuntimeConfiguration = Readonly<{
  applicationName: string;
  caCertificate?: string;
  connectionTimeoutMs: number;
  databaseUrl: string;
  idleTimeoutMs: number;
  poolMax: number;
  sslMode: PostgresSslMode;
  statementTimeoutMs: number;
}>;

export type PostgresMigration = Readonly<{
  id: string;
  sql: string;
}>;

type AppliedMigrationRow = {
  checksum: string;
  migration_id: string;
};

function normalizeRowCount(rowCount: number | null): number {
  return rowCount ?? 0;
}

function migrationChecksum(migration: PostgresMigration): string {
  return createHash("sha256").update(migration.sql).digest("hex");
}

function createPoolConfiguration(
  configuration: PostgresRuntimeConfiguration,
): PoolConfig {
  const ssl =
    configuration.sslMode === "disable"
      ? false
      : {
          ca: configuration.caCertificate,
          rejectUnauthorized: configuration.sslMode === "verify-full",
        };
  return {
    application_name: configuration.applicationName,
    connectionString: configuration.databaseUrl,
    connectionTimeoutMillis: configuration.connectionTimeoutMs,
    idleTimeoutMillis: configuration.idleTimeoutMs,
    max: configuration.poolMax,
    ssl,
    statement_timeout: configuration.statementTimeoutMs,
  };
}

class NodePostgresPoolAdapter implements PostgresPoolPort {
  private readonly pool: Pool;

  constructor(configuration: PostgresRuntimeConfiguration) {
    this.pool = new Pool(createPoolConfiguration(configuration));
  }

  async connect(): Promise<PostgresClientPort> {
    const client = await this.pool.connect();
    return {
      query: async <Row extends SqlRow>(
        text: string,
        values?: readonly SqlValue[],
      ): Promise<SqlQueryResult<Row>> => {
        const result = await client.query<Row>(
          text,
          values === undefined ? undefined : [...values],
        );
        return {
          rowCount: normalizeRowCount(result.rowCount),
          rows: result.rows,
        };
      },
      release: () => {
        client.release();
      },
    };
  }

  async end(): Promise<void> {
    await this.pool.end();
  }

  async query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    const result = await this.pool.query<Row>(
      text,
      values === undefined ? undefined : [...values],
    );
    return {
      rowCount: normalizeRowCount(result.rowCount),
      rows: result.rows,
    };
  }
}

export class PostgresDatabase implements TransactionalSqlExecutor {
  private readonly pool: PostgresPoolPort;

  constructor(pool: PostgresPoolPort) {
    this.pool = pool;
  }

  close(): Promise<void> {
    return this.pool.end();
  }

  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    return this.pool.query<Row>(text, values);
  }

  async transaction<Result>(
    work: (connection: SqlExecutor) => Promise<Result>,
  ): Promise<Result> {
    const connection = await this.pool.connect();
    try {
      await connection.query("begin");
      const result = await work(connection);
      await connection.query("commit");
      return result;
    } catch (error) {
      await connection.query("rollback");
      throw error;
    } finally {
      connection.release();
    }
  }
}

export function createPostgresDatabase(
  configuration: PostgresRuntimeConfiguration,
): PostgresDatabase {
  return new PostgresDatabase(
    new NodePostgresPoolAdapter(configuration),
  );
}

export async function runPostgresMigrations(
  database: TransactionalSqlExecutor,
  migrations: readonly PostgresMigration[],
): Promise<void> {
  const ordered = [...migrations].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const duplicateId = ordered.find(
    (migration, index) =>
      index > 0 && migration.id === ordered[index - 1]?.id,
  );
  if (duplicateId !== undefined) {
    throw new Error(`Duplicate migration id: ${duplicateId.id}`);
  }

  await database.transaction(async (connection) => {
    await connection.query(
      "select pg_advisory_xact_lock(hashtext('support-schema-migrations'))",
    );
    await connection.query(`
      create table if not exists support_schema_migrations (
        migration_id text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )
    `);
    await connection.query(
      "alter table support_schema_migrations enable row level security",
    );
    await connection.query(
      "alter table support_schema_migrations enable row level security",
    );
    const applied = await connection.query<AppliedMigrationRow>(
      "select migration_id, checksum from support_schema_migrations",
    );
    const checksums = new Map(
      applied.rows.map((row) => [row.migration_id, row.checksum]),
    );

    for (const migration of ordered) {
      const checksum = migrationChecksum(migration);
      const existing = checksums.get(migration.id);
      if (existing !== undefined) {
        if (existing !== checksum) {
          throw new Error(
            `Applied migration checksum changed: ${migration.id}`,
          );
        }
        continue;
      }
      await connection.query(migration.sql);
      await connection.query(
        "insert into support_schema_migrations (migration_id, checksum) values ($1, $2)",
        [migration.id, checksum],
      );
    }
  });
}

export async function assertPostgresMigrationsApplied(
  database: SqlExecutor,
  migrations: readonly PostgresMigration[],
): Promise<void> {
  if (migrations.length === 0) {
    return;
  }
  const ordered = [...migrations].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const placeholders = ordered.map((_, index) => `$${index + 1}`);
  try {
    const applied = await database.query<AppliedMigrationRow>(
      `select migration_id, checksum
         from support_schema_migrations
        where migration_id in (${placeholders.join(", ")})`,
      ordered.map((migration) => migration.id),
    );
    const checksums = new Map(
      applied.rows.map((row) => [row.migration_id, row.checksum]),
    );
    const isReady = ordered.every(
      (migration) =>
        checksums.get(migration.id) === migrationChecksum(migration),
    );
    if (!isReady) {
      throw new Error("Database schema is not at the required version.");
    }
  } catch {
    throw new Error("Database schema is not at the required version.");
  }
}
