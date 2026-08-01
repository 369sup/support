import "server-only";

import {
  resolveSupabasePostgresConfiguration,
  type SupabasePostgresConnectionMode,
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

const productionRuntimeSchema = z
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
    SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
    SUPABASE_POSTGRES_CONNECTION_MODE: z
      .enum(["direct", "session-pooler", "transaction-pooler"])
      .default("transaction-pooler"),
    SUPABASE_SECRET_KEY: z.string().trim().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().trim().min(1),
    SUPABASE_URL: z.string().trim().min(1),
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

export function resolveProductionRuntimeConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ProductionRuntimeConfiguration {
  const parsed = productionRuntimeSchema.parse(environment);
  const databaseUrl = optionalNonEmpty(parsed.DATABASE_URL);
  if (databaseUrl === undefined) {
    throw new Error("DATABASE_URL is required for the Supabase runtime.");
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
  const connectionMode = parsed.SUPABASE_POSTGRES_CONNECTION_MODE;
  const authConfiguration = resolveSupabaseAuthConfiguration({
    publishableKey: parsed.SUPABASE_PUBLISHABLE_KEY,
    url: parsed.SUPABASE_URL,
  });
  const serverConfiguration = resolveSupabaseServerConfiguration({
    secretKey: parsed.SUPABASE_SECRET_KEY,
    url: parsed.SUPABASE_URL,
  });
  resolveSupabasePostgresConfiguration({
    ...common,
    connectionMode,
    sslMode: parsed.DATABASE_SSL_MODE,
  });
  return {
    provider: "supabase",
    supabase: {
      ...common,
      connectionMode,
      publishableKey: authConfiguration.publishableKey,
      secretKey: serverConfiguration.secretKey,
      sslMode: parsed.DATABASE_SSL_MODE,
      storageBucket: parsed.SUPABASE_STORAGE_BUCKET,
      url: authConfiguration.url,
    },
  };
}
