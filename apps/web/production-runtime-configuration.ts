import "server-only";

import {
  resolveSupabasePostgresConfiguration,
  type SupabasePostgresConnectionMode,
  type SupabasePostgresRuntimeConfiguration,
} from "@support/supabase/postgres";
import { resolveSupabaseAuthConfiguration } from "@support/supabase/auth";
import {
  resolveSupabaseServerConfiguration,
} from "@support/supabase/storage";
import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

export const requiredProductionRuntimeEnvironmentNames = [
  "DATABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "SUPABASE_URL",
] as const;

const productionDatabaseSchema = z
  .object({
    DATABASE_CA_CERTIFICATE: z.string().optional(),
    DATABASE_CONNECTION_TIMEOUT_MS: positiveInteger.default(5000),
    DATABASE_IDLE_TIMEOUT_MS: positiveInteger.default(10_000),
    DATABASE_POOL_MAX: positiveInteger.max(100).default(10),
    DATABASE_SSL_MODE: z
      .enum(["require", "verify-full"])
      .default("verify-full"),
    DATABASE_STATEMENT_TIMEOUT_MS: positiveInteger.default(30_000),
    DATABASE_URL: z.string().trim().min(1),
    SUPABASE_POSTGRES_CONNECTION_MODE: z
      .enum(["direct", "session-pooler", "transaction-pooler"])
      .default("transaction-pooler"),
  })
  .superRefine((configuration, context) => {
    if (configuration.DATABASE_URL.trim() === "") {
      context.addIssue({
        code: "custom",
        message: "DATABASE_URL is required for the Supabase runtime.",
        path: ["DATABASE_URL"],
      });
    }
  });

const productionRuntimeSchema = productionDatabaseSchema.extend({
  SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
  SUPABASE_SECRET_KEY: z.string().trim().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().trim().min(1),
  SUPABASE_URL: z.string().trim().min(1),
});

export type ProductionDatabaseConfiguration = Readonly<{
  provider: "supabase";
  supabase: SupabasePostgresRuntimeConfiguration & {
    sslMode: "require" | "verify-full";
  };
}>;

export type ProductionRuntimeConfiguration = Readonly<{
  provider: "supabase";
  supabase: {
    applicationName: string;
    caCertificate?: string;
    connectionMode: SupabasePostgresConnectionMode;
    connectionTimeoutMs: number;
    databaseUrl: string;
    idleTimeoutMs: number;
    poolMax: number;
    publishableKey: string;
    secretKey: string;
    sslMode: "require" | "verify-full";
    statementTimeoutMs: number;
    storageBucket: string;
    url: string;
  };
}>;

function optionalNonEmpty(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === undefined || normalized === ""
    ? undefined
    : normalized;
}

export function resolveProductionDatabaseConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionDatabaseConfiguration {
  const parsed = productionDatabaseSchema.parse(environment);
  const databaseUrl = optionalNonEmpty(parsed.DATABASE_URL);
  if (databaseUrl === undefined) {
    throw new Error("DATABASE_URL is required for the Supabase runtime.");
  }
  const caCertificate = optionalNonEmpty(
    parsed.DATABASE_CA_CERTIFICATE,
  );
  const supabase: ProductionDatabaseConfiguration["supabase"] = {
    applicationName: "support-web",
    ...(caCertificate === undefined ? {} : { caCertificate }),
    connectionMode: parsed.SUPABASE_POSTGRES_CONNECTION_MODE,
    connectionTimeoutMs: parsed.DATABASE_CONNECTION_TIMEOUT_MS,
    databaseUrl,
    idleTimeoutMs: parsed.DATABASE_IDLE_TIMEOUT_MS,
    poolMax: parsed.DATABASE_POOL_MAX,
    sslMode: parsed.DATABASE_SSL_MODE,
    statementTimeoutMs: parsed.DATABASE_STATEMENT_TIMEOUT_MS,
  };
  resolveSupabasePostgresConfiguration(supabase);
  return {
    provider: "supabase",
    supabase,
  };
}

export function resolveProductionRuntimeConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionRuntimeConfiguration {
  const parsed = productionRuntimeSchema.parse(environment);
  const databaseConfiguration =
    resolveProductionDatabaseConfiguration(environment);
  const authConfiguration = resolveSupabaseAuthConfiguration({
    publishableKey: parsed.SUPABASE_PUBLISHABLE_KEY,
    url: parsed.SUPABASE_URL,
  });
  const serverConfiguration = resolveSupabaseServerConfiguration({
    secretKey: parsed.SUPABASE_SECRET_KEY,
    url: parsed.SUPABASE_URL,
  });
  return {
    provider: "supabase",
    supabase: {
      ...databaseConfiguration.supabase,
      publishableKey: authConfiguration.publishableKey,
      secretKey: serverConfiguration.secretKey,
      storageBucket: parsed.SUPABASE_STORAGE_BUCKET,
      url: authConfiguration.url,
    },
  };
}
