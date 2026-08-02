import { AsyncLocalStorage } from "node:async_hooks";

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

function normalizeRowCount(rowCount: number | null): number {
  return rowCount ?? 0;
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
  private readonly transactionConnection =
    new AsyncLocalStorage<SqlExecutor>();

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
    const connection = this.transactionConnection.getStore();
    if (connection !== undefined) {
      return connection.query<Row>(text, values);
    }
    return this.pool.query<Row>(text, values);
  }

  async transaction<Result>(
    work: (connection: SqlExecutor) => Promise<Result>,
  ): Promise<Result> {
    const activeConnection = this.transactionConnection.getStore();
    if (activeConnection !== undefined) {
      return work(activeConnection);
    }
    const connection = await this.pool.connect();
    try {
      await connection.query("begin");
      const result = await this.transactionConnection.run(
        connection,
        () => work(connection),
      );
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
