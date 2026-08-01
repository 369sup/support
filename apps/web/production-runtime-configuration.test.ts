import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  requiredProductionRuntimeEnvironmentNames,
  resolveProductionDatabaseConfiguration,
  resolveProductionRuntimeConfiguration,
} from "./production-runtime-configuration";

const completeEnvironment = {
  DATABASE_URL:
    "postgres://support:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
  SUPABASE_POSTGRES_CONNECTION_MODE: "transaction-pooler",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  SUPABASE_SECRET_KEY: "sb_secret_example",
  SUPABASE_STORAGE_BUCKET: "support-media",
  SUPABASE_URL: "https://project.supabase.co",
} as const;

const deprecatedRuntimeSelectorNames = [
  "DATABASE_PROVIDER",
  "SUPPORT_RUNTIME_MODE",
] as const;

const turboConfigurationSchema = z.object({
  tasks: z.record(
    z.string(),
    z.looseObject({
      env: z.array(z.string()).optional(),
    }),
  ),
});

function readRepositoryFile(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function hasEnvironmentAssignment(contents: string, name: string): boolean {
  return new RegExp(`^\\s*${name}(?:=|:)`, "mu").test(contents);
}

describe("production runtime configuration", () => {
  it("does not require privileged Supabase credentials for PostgreSQL", () => {
    expect(
      resolveProductionDatabaseConfiguration({
        DATABASE_URL: completeEnvironment.DATABASE_URL,
        SUPABASE_POSTGRES_CONNECTION_MODE:
          completeEnvironment.SUPABASE_POSTGRES_CONNECTION_MODE,
      }),
    ).toEqual({
      provider: "supabase",
      supabase: {
        applicationName: "support-web",
        connectionMode: "transaction-pooler",
        connectionTimeoutMs: 5000,
        databaseUrl: completeEnvironment.DATABASE_URL,
        idleTimeoutMs: 10000,
        poolMax: 10,
        sslMode: "verify-full",
        statementTimeoutMs: 30000,
      },
    });
  });

  it("fails closed when the Supabase runtime is incomplete", () => {
    expect(() => resolveProductionRuntimeConfiguration({})).toThrow();
  });

  it.each(requiredProductionRuntimeEnvironmentNames)(
    "fails closed without required environment variable %s",
    (missingName) => {
      const incompleteEnvironment = Object.fromEntries(
        Object.entries(completeEnvironment).filter(
          ([name]) => name !== missingName,
        ),
      );
      expect(() =>
        resolveProductionRuntimeConfiguration(incompleteEnvironment),
      ).toThrow();
    },
  );

  it("keeps documented, cached, and CI runtime inputs aligned", () => {
    const environmentExample = readRepositoryFile("../../.env.example");
    const workflow = readRepositoryFile("../../.github/workflows/ci.yml");
    const turbo = turboConfigurationSchema.parse(
      JSON.parse(readRepositoryFile("../../turbo.json")),
    );
    const buildEnvironment = turbo.tasks["@support/web#build"]?.env ?? [];
    const endToEndEnvironment = turbo.tasks["test:e2e"]?.env ?? [];

    for (const name of requiredProductionRuntimeEnvironmentNames) {
      expect(hasEnvironmentAssignment(environmentExample, name)).toBe(true);
      expect(buildEnvironment).toContain(name);
      expect(endToEndEnvironment).toContain(name);
      expect(hasEnvironmentAssignment(workflow, name)).toBe(true);
    }

    for (const name of deprecatedRuntimeSelectorNames) {
      expect(buildEnvironment).not.toContain(name);
      expect(endToEndEnvironment).not.toContain(name);
      expect(hasEnvironmentAssignment(workflow, name)).toBe(false);
    }
  });

  it("normalizes the single Supabase production configuration", () => {
    expect(
      resolveProductionRuntimeConfiguration({
        ...completeEnvironment,
        DATABASE_CONNECTION_TIMEOUT_MS: "2500",
        DATABASE_IDLE_TIMEOUT_MS: "9000",
        DATABASE_POOL_MAX: "12",
        DATABASE_SSL_MODE: "require",
        DATABASE_STATEMENT_TIMEOUT_MS: "15000",
      }),
    ).toEqual({
      provider: "supabase",
      supabase: {
        applicationName: "support-web",
        connectionMode: "transaction-pooler",
        connectionTimeoutMs: 2500,
        databaseUrl: completeEnvironment.DATABASE_URL,
        idleTimeoutMs: 9000,
        poolMax: 12,
        publishableKey: "sb_publishable_example",
        secretKey: "sb_secret_example",
        sslMode: "require",
        statementTimeoutMs: 15000,
        storageBucket: "support-media",
        url: "https://project.supabase.co",
      },
    });
  });

  it("rejects a publishable key in the server secret slot", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        ...completeEnvironment,
        SUPABASE_SECRET_KEY: "sb_publishable_wrong",
      }),
    ).toThrow("secret key");
  });

  it("rejects disabled TLS", () => {
    expect(() =>
      resolveProductionRuntimeConfiguration({
        ...completeEnvironment,
        DATABASE_SSL_MODE: "disable",
      }),
    ).toThrow();
  });

  it("rejects a pooler URL on the wrong port without leaking credentials", () => {
    const databaseUrl =
      "postgres://support:do-not-leak@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
    expect(() =>
      resolveProductionRuntimeConfiguration({
        ...completeEnvironment,
        DATABASE_URL: databaseUrl,
      }),
    ).toThrow("port 6543");

    try {
      resolveProductionRuntimeConfiguration({
        ...completeEnvironment,
        DATABASE_URL: databaseUrl,
      });
    } catch (error) {
      expect(String(error)).not.toContain("do-not-leak");
    }
  });
});
