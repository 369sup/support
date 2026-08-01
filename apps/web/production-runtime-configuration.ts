import "server-only";

import {
  resolveSupabasePostgresConfiguration,
  type SupabasePostgresConnectionMode,
} from "@support/supabase/postgres";
import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

const productionRuntimeSchema = z
  .object({
    DATABASE_CA_CERTIFICATE: z.string().optional(),
    DATABASE_CONNECTION_TIMEOUT_MS: positiveInteger.default(5000),
    DATABASE_IDLE_TIMEOUT_MS: positiveInteger.default(10_000),
    DATABASE_POOL_MAX: positiveInteger.max(100).default(10),
    DATABASE_PROVIDER: z.enum(["postgres", "supabase"]).default("postgres"),
    DATABASE_SSL_MODE: z
      .enum(["disable", "require", "verify-full"])
      .default("verify-full"),
    DATABASE_STATEMENT_TIMEOUT_MS: positiveInteger.default(30_000),
    DATABASE_URL: z.string().trim().optional(),
    SUPABASE_POSTGRES_CONNECTION_MODE: z
      .enum(["direct", "session-pooler", "transaction-pooler"])
      .optional(),
    SUPPORT_RUNTIME_MODE: z.enum(["memory", "postgres"]).default("memory"),
  })
  .superRefine((configuration, context) => {
    if (
      configuration.SUPPORT_RUNTIME_MODE === "postgres" &&
      (configuration.DATABASE_URL === undefined ||
        configuration.DATABASE_URL === "")
    ) {
      context.addIssue({
        code: "custom",
        message:
          "DATABASE_URL is required when SUPPORT_RUNTIME_MODE is postgres.",
        path: ["DATABASE_URL"],
      });
    }
    if (
      configuration.SUPPORT_RUNTIME_MODE === "postgres" &&
      configuration.DATABASE_PROVIDER === "supabase" &&
      configuration.SUPABASE_POSTGRES_CONNECTION_MODE === undefined
    ) {
      context.addIssue({
        code: "custom",
        message:
          "SUPABASE_POSTGRES_CONNECTION_MODE is required when DATABASE_PROVIDER is supabase.",
        path: ["SUPABASE_POSTGRES_CONNECTION_MODE"],
      });
    }
    if (
      configuration.SUPPORT_RUNTIME_MODE === "postgres" &&
      configuration.DATABASE_PROVIDER === "supabase" &&
      configuration.DATABASE_SSL_MODE === "disable"
    ) {
      context.addIssue({
        code: "custom",
        message: "Supabase PostgreSQL connections require TLS.",
        path: ["DATABASE_SSL_MODE"],
      });
    }
  });

export type ProductionRuntimeConfiguration =
  | Readonly<{ mode: "memory" }>
  | Readonly<{
      mode: "postgres";
      provider: "postgres";
      postgres: {
        applicationName: string;
        caCertificate?: string;
        connectionTimeoutMs: number;
        databaseUrl: string;
        idleTimeoutMs: number;
        poolMax: number;
        sslMode: "disable" | "require" | "verify-full";
        statementTimeoutMs: number;
      };
    }>
  | Readonly<{
      mode: "postgres";
      provider: "supabase";
      supabase: {
        applicationName: string;
        caCertificate?: string;
        connectionMode: SupabasePostgresConnectionMode;
        connectionTimeoutMs: number;
        databaseUrl: string;
        idleTimeoutMs: number;
        poolMax: number;
        sslMode: "require" | "verify-full";
        statementTimeoutMs: number;
      };
    }>;

function optionalNonEmpty(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === undefined || normalized === ""
    ? undefined
    : normalized;
}

export function resolveProductionRuntimeConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionRuntimeConfiguration {
  const parsed = productionRuntimeSchema.parse(environment);
  if (parsed.SUPPORT_RUNTIME_MODE === "memory") {
    return { mode: "memory" };
  }

  const databaseUrl = optionalNonEmpty(parsed.DATABASE_URL);
  if (databaseUrl === undefined) {
    throw new Error(
      "DATABASE_URL is required when SUPPORT_RUNTIME_MODE is postgres.",
    );
  }
  const caCertificate = optionalNonEmpty(
    parsed.DATABASE_CA_CERTIFICATE,
  );
  const common = {
    applicationName: "support-web",
    ...(caCertificate === undefined ? {} : { caCertificate }),
    connectionTimeoutMs: parsed.DATABASE_CONNECTION_TIMEOUT_MS,
    databaseUrl,
    idleTimeoutMs: parsed.DATABASE_IDLE_TIMEOUT_MS,
    poolMax: parsed.DATABASE_POOL_MAX,
    statementTimeoutMs: parsed.DATABASE_STATEMENT_TIMEOUT_MS,
  };
  if (parsed.DATABASE_PROVIDER === "supabase") {
    const connectionMode = parsed.SUPABASE_POSTGRES_CONNECTION_MODE;
    if (connectionMode === undefined || parsed.DATABASE_SSL_MODE === "disable") {
      throw new Error("Supabase PostgreSQL configuration is incomplete.");
    }
    resolveSupabasePostgresConfiguration({
      ...common,
      connectionMode,
      sslMode: parsed.DATABASE_SSL_MODE,
    });
    return {
      mode: "postgres",
      provider: "supabase",
      supabase: {
        ...common,
        connectionMode,
        sslMode: parsed.DATABASE_SSL_MODE,
      },
    };
  }
  return {
    mode: "postgres",
    provider: "postgres",
    postgres: {
      ...common,
      sslMode: parsed.DATABASE_SSL_MODE,
    },
  };
}
