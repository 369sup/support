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
