import "server-only";

import {
  createPostgresDatabase,
  type PostgresDatabase,
  type PostgresRuntimeConfiguration,
} from "@support/database/postgres";

export type SupabasePostgresConnectionMode =
  | "direct"
  | "session-pooler"
  | "transaction-pooler";

export type SupabasePostgresRuntimeConfiguration = Readonly<
  Omit<PostgresRuntimeConfiguration, "sslMode"> & {
    connectionMode: SupabasePostgresConnectionMode;
    sslMode?: "require" | "verify-full";
  }
>;

const directHostPattern = /^db\.[a-z0-9-]+\.supabase\.co$/u;
const poolerHostPattern = /^[a-z0-9-]+\.pooler\.supabase\.com$/u;

function parseDatabaseUrl(databaseUrl: string): URL {
  try {
    return new URL(databaseUrl);
  } catch {
    throw new Error("Supabase PostgreSQL URL is invalid.");
  }
}

function assertProtocol(url: URL): void {
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error("Supabase PostgreSQL URL must use postgres or postgresql.");
  }
  if (url.username === "" || url.hostname === "") {
    throw new Error("Supabase PostgreSQL URL is missing connection identity.");
  }
}

function assertTls(url: URL): void {
  if (url.searchParams.get("sslmode") === "disable") {
    throw new Error("Supabase PostgreSQL connections must use TLS.");
  }
}

function assertConnectionMode(
  url: URL,
  connectionMode: SupabasePostgresConnectionMode,
): void {
  const port = url.port === "" ? "5432" : url.port;
  const isDirectHost = directHostPattern.test(url.hostname);
  const isPoolerHost = poolerHostPattern.test(url.hostname);

  if (connectionMode === "direct" && (!isDirectHost || port !== "5432")) {
    throw new Error(
      "Supabase direct connections require the direct database host on port 5432.",
    );
  }
  if (
    connectionMode === "session-pooler" &&
    (!isPoolerHost || port !== "5432")
  ) {
    throw new Error(
      "Supabase session pooler connections require a pooler host on port 5432.",
    );
  }
  if (
    connectionMode === "transaction-pooler" &&
    (!isPoolerHost || port !== "6543")
  ) {
    throw new Error(
      "Supabase transaction pooler connections require a Supabase host on port 6543.",
    );
  }
}

export function resolveSupabasePostgresConfiguration(
  configuration: SupabasePostgresRuntimeConfiguration,
): PostgresRuntimeConfiguration {
  const url = parseDatabaseUrl(configuration.databaseUrl);
  assertProtocol(url);
  assertTls(url);
  assertConnectionMode(url, configuration.connectionMode);

  return {
    applicationName: configuration.applicationName,
    ...(configuration.caCertificate === undefined
      ? {}
      : { caCertificate: configuration.caCertificate }),
    connectionTimeoutMs: configuration.connectionTimeoutMs,
    databaseUrl: configuration.databaseUrl,
    idleTimeoutMs: configuration.idleTimeoutMs,
    poolMax: configuration.poolMax,
    sslMode: configuration.sslMode ?? "verify-full",
    statementTimeoutMs: configuration.statementTimeoutMs,
  };
}

export function createSupabasePostgresDatabase(
  configuration: SupabasePostgresRuntimeConfiguration,
): PostgresDatabase {
  return createPostgresDatabase(
    resolveSupabasePostgresConfiguration(configuration),
  );
}
