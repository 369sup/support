import { describe, expect, it } from "vitest";

import { resolveProductionRuntimeConfiguration } from "./production-runtime-configuration";

describe("production runtime configuration", () => {
  it("defaults to the non-durable development runtime", () => {
    expect(resolveProductionRuntimeConfiguration({})).toEqual({
      mode: "memory",
    });
  });

  it("requires a database URL for postgres mode", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toThrow("DATABASE_URL is required");
  });

  it("normalizes a complete postgres configuration", () => {
    expect(
      resolveProductionRuntimeConfiguration({
        DATABASE_CONNECTION_TIMEOUT_MS: "2500",
        DATABASE_IDLE_TIMEOUT_MS: "9000",
        DATABASE_POOL_MAX: "12",
        DATABASE_SSL_MODE: "require",
        DATABASE_STATEMENT_TIMEOUT_MS: "15000",
        DATABASE_URL: " postgres://support:secret@db/support ",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toEqual({
      mode: "postgres",
      provider: "postgres",
      postgres: {
        applicationName: "support-web",
        connectionTimeoutMs: 2500,
        databaseUrl: "postgres://support:secret@db/support",
        idleTimeoutMs: 9000,
        poolMax: 12,
        sslMode: "require",
        statementTimeoutMs: 15000,
      },
    });
  });

  it.each([
    [
      "session-pooler",
      "postgres://support:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
    ],
    [
      "transaction-pooler",
      "postgres://support:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    ],
  ] as const)(
    "normalizes a Supabase %s configuration",
    (connectionMode, databaseUrl) => {
      expect(
        resolveProductionRuntimeConfiguration({
          DATABASE_PROVIDER: "supabase",
          DATABASE_URL: databaseUrl,
          SUPABASE_POSTGRES_CONNECTION_MODE: connectionMode,
          SUPPORT_RUNTIME_MODE: "postgres",
        }),
      ).toEqual({
        mode: "postgres",
        provider: "supabase",
        supabase: {
          applicationName: "support-web",
          connectionMode,
          connectionTimeoutMs: 5000,
          databaseUrl,
          idleTimeoutMs: 10_000,
          poolMax: 10,
          sslMode: "verify-full",
          statementTimeoutMs: 30_000,
        },
      });
    },
  );

  it("requires an explicit Supabase connection mode", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        DATABASE_PROVIDER: "supabase",
        DATABASE_URL:
          "postgres://support:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toThrow("SUPABASE_POSTGRES_CONNECTION_MODE is required");
  });

  it("rejects disabled TLS for Supabase", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        DATABASE_PROVIDER: "supabase",
        DATABASE_SSL_MODE: "disable",
        DATABASE_URL:
          "postgres://support:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
        SUPABASE_POSTGRES_CONNECTION_MODE: "session-pooler",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toThrow("Supabase PostgreSQL connections require TLS");
  });

  it("rejects a Supabase pooler URL on the wrong port", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        DATABASE_PROVIDER: "supabase",
        DATABASE_URL:
          "postgres://support:do-not-leak@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
        SUPABASE_POSTGRES_CONNECTION_MODE: "transaction-pooler",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toThrow("port 6543");

    try {
      resolveProductionRuntimeConfiguration({
        DATABASE_PROVIDER: "supabase",
        DATABASE_URL:
          "postgres://support:do-not-leak@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
        SUPABASE_POSTGRES_CONNECTION_MODE: "transaction-pooler",
        SUPPORT_RUNTIME_MODE: "postgres",
      });
    } catch (error) {
      expect(String(error)).not.toContain("do-not-leak");
    }
  });

  it("rejects invalid pool and timeout values", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        DATABASE_POOL_MAX: "0",
        DATABASE_URL: "postgres://db/support",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toThrow();
  });
});
