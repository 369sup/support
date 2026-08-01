import { describe, expect, it } from "vitest";

import {
  resolveSupabasePostgresConfiguration,
  type SupabasePostgresRuntimeConfiguration,
} from "../src/postgres";

function configuration(
  databaseUrl: string,
  connectionMode: SupabasePostgresRuntimeConfiguration["connectionMode"],
): SupabasePostgresRuntimeConfiguration {
  return {
    applicationName: "support-test",
    connectionMode,
    connectionTimeoutMs: 2500,
    databaseUrl,
    idleTimeoutMs: 9000,
    poolMax: 2,
    statementTimeoutMs: 15_000,
  };
}

describe("Supabase PostgreSQL configuration", () => {
  it("resolves direct connections with verified TLS", () => {
    expect(
      resolveSupabasePostgresConfiguration(
        configuration(
          "postgresql://postgres:secret@db.abcdefghijkl.supabase.co:5432/postgres",
          "direct",
        ),
      ),
    ).toEqual({
      applicationName: "support-test",
      connectionTimeoutMs: 2500,
      databaseUrl:
        "postgresql://postgres:secret@db.abcdefghijkl.supabase.co:5432/postgres",
      idleTimeoutMs: 9000,
      poolMax: 2,
      sslMode: "verify-full",
      statementTimeoutMs: 15_000,
    });
  });

  it.each([
    [
      "session-pooler",
      "postgres://postgres.project:secret@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
    ],
    [
      "transaction-pooler",
      "postgres://postgres.project:secret@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    ],
  ] as const)("accepts the %s connection profile", (mode, databaseUrl) => {
    expect(
      resolveSupabasePostgresConfiguration(
        configuration(databaseUrl, mode),
      ).sslMode,
    ).toBe("verify-full");
  });

  it("rejects mismatched connection modes without exposing credentials", () => {
    const databaseUrl =
      "postgres://postgres.project:do-not-leak@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

    expect(() =>
      resolveSupabasePostgresConfiguration(
        configuration(databaseUrl, "session-pooler"),
      ),
    ).toThrow("port 5432");

    try {
      resolveSupabasePostgresConfiguration(
        configuration(databaseUrl, "session-pooler"),
      );
    } catch (error) {
      expect(String(error)).not.toContain("do-not-leak");
    }
  });

  it("rejects disabled TLS without exposing credentials", () => {
    const databaseUrl =
      "postgres://postgres.project:do-not-leak@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=disable";

    expect(() =>
      resolveSupabasePostgresConfiguration(
        configuration(databaseUrl, "transaction-pooler"),
      ),
    ).toThrow("must use TLS");

    try {
      resolveSupabasePostgresConfiguration(
        configuration(databaseUrl, "transaction-pooler"),
      );
    } catch (error) {
      expect(String(error)).not.toContain("do-not-leak");
    }
  });
});
