import "server-only";

import {
  PostgresDatabase,
  type PostgresClientPort,
  type PostgresPoolPort,
  type SqlQueryResult,
  type SqlRow,
  type SqlValue,
} from "@support/database/postgres";
import { createSupabasePostgresDatabase } from "@support/supabase/postgres";

import { supportDatabaseSchemaContractVersion } from "./database-schema-contract";
import {
  resolveProductionDatabaseConfiguration,
  resolveProductionRuntimeConfiguration,
  type ProductionRuntimeConfiguration,
} from "./production-runtime-configuration";

declare global {
  var __supportPostgresDatabaseV1: PostgresDatabase | undefined;
  var __supportLazyPostgresDatabaseV1: PostgresDatabase | undefined;
  var __supportPostgresDatabaseReadyV1: Promise<PostgresDatabase> | undefined;
}

type SchemaContractRow = {
  contract_version: string;
};

const unusedPool: PostgresPoolPort = {
  connect(): Promise<PostgresClientPort> {
    return Promise.reject(new Error("Lazy database pool is never connected."));
  },
  end(): Promise<void> {
    return Promise.resolve();
  },
  query<Row extends SqlRow>(): Promise<SqlQueryResult<Row>> {
    return Promise.reject(new Error("Lazy database pool is never queried."));
  },
};

class DeferredPromise<Result> implements Promise<Result> {
  readonly [Symbol.toStringTag] = "Promise";
  private readonly factory: () => Promise<Result>;
  private promise: Promise<Result> | undefined;

  constructor(factory: () => Promise<Result>) {
    this.factory = factory;
  }

  then<Success = Result, Failure = never>(
    handleSuccess?:
      | ((value: Result) => PromiseLike<Success> | Success)
      | null,
    handleFailure?:
      | ((reason: unknown) => Failure | PromiseLike<Failure>)
      | null,
  ): Promise<Failure | Success> {
    return this.resolve().then(handleSuccess, handleFailure);
  }

  catch<Failure = never>(
    handleFailure?:
      | ((reason: unknown) => Failure | PromiseLike<Failure>)
      | null,
  ): Promise<Failure | Result> {
    return this.resolve().catch(handleFailure);
  }

  finally(handleFinally?: (() => void) | null): Promise<Result> {
    return this.resolve().finally(handleFinally);
  }

  private resolve(): Promise<Result> {
    this.promise ??= this.factory();
    return this.promise;
  }
}

function resolveProductionDatabase(): PostgresDatabase {
  const configuration = resolveProductionDatabaseConfiguration();
  globalThis.__supportPostgresDatabaseV1 ??=
    createSupabasePostgresDatabase(configuration.supabase);
  return globalThis.__supportPostgresDatabaseV1;
}

async function verifyProductionDatabaseContract(): Promise<PostgresDatabase> {
  const database = resolveProductionDatabase();
  let result: SqlQueryResult<SchemaContractRow>;
  try {
    result = await database.query<SchemaContractRow>(
      `select contract_version
         from support_private.schema_contract
        where contract_name = $1`,
      ["support-web"],
    );
  } catch {
    throw new Error("Database schema contract is unavailable.");
  }
  if (
    result.rowCount !== 1 ||
    result.rows[0]?.contract_version !== supportDatabaseSchemaContractVersion
  ) {
    throw new Error("Database schema contract version does not match the application.");
  }
  return database;
}

function resolveReadyProductionDatabase(): Promise<PostgresDatabase> {
  globalThis.__supportPostgresDatabaseReadyV1 ??=
    verifyProductionDatabaseContract();
  return globalThis.__supportPostgresDatabaseReadyV1;
}

class LazyProductionDatabase extends PostgresDatabase {
  constructor() {
    super(unusedPool);
  }

  override close(): Promise<void> {
    return closeProductionDatabase();
  }

  override query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    return new DeferredPromise(async () => {
      const database = await resolveReadyProductionDatabase();
      return database.query<Row>(text, values);
    });
  }

  override transaction<Result>(
    work: (
      connection: Pick<PostgresDatabase, "query">,
    ) => Promise<Result>,
  ): Promise<Result> {
    return new DeferredPromise(async () => {
      const database = await resolveReadyProductionDatabase();
      return database.transaction(work);
    });
  }
}

export function getProductionDatabase(): PostgresDatabase {
  globalThis.__supportLazyPostgresDatabaseV1 ??=
    new LazyProductionDatabase();
  void resolveReadyProductionDatabase().catch(() => undefined);
  return globalThis.__supportLazyPostgresDatabaseV1;
}

export function getProductionSupabaseConfiguration(): ProductionRuntimeConfiguration["supabase"] {
  return resolveProductionRuntimeConfiguration().supabase;
}

export async function closeProductionDatabase(): Promise<void> {
  const database = globalThis.__supportPostgresDatabaseV1;
  if (database === undefined) {
    return;
  }
  globalThis.__supportPostgresDatabaseV1 = undefined;
  globalThis.__supportLazyPostgresDatabaseV1 = undefined;
  globalThis.__supportPostgresDatabaseReadyV1 = undefined;
  await database.close();
}
