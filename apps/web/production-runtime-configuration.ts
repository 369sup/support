import "server-only";

import { z } from "zod";

const positiveInteger = z.coerce.number().int().positive();

const productionRuntimeSchema = z
  .object({
    DATABASE_CA_CERTIFICATE: z.string().optional(),
    DATABASE_CONNECTION_TIMEOUT_MS: positiveInteger.default(5000),
    DATABASE_IDLE_TIMEOUT_MS: positiveInteger.default(10_000),
    DATABASE_POOL_MAX: positiveInteger.max(100).default(10),
    DATABASE_SSL_MODE: z
      .enum(["disable", "require", "verify-full"])
      .default("verify-full"),
    DATABASE_STATEMENT_TIMEOUT_MS: positiveInteger.default(30_000),
    DATABASE_URL: z.string().trim().optional(),
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
  });

export type ProductionRuntimeConfiguration =
  | Readonly<{ mode: "memory" }>
  | Readonly<{
      mode: "postgres";
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
  return {
    mode: "postgres",
    postgres: {
      applicationName: "support-web",
      ...(caCertificate === undefined ? {} : { caCertificate }),
      connectionTimeoutMs: parsed.DATABASE_CONNECTION_TIMEOUT_MS,
      databaseUrl,
      idleTimeoutMs: parsed.DATABASE_IDLE_TIMEOUT_MS,
      poolMax: parsed.DATABASE_POOL_MAX,
      sslMode: parsed.DATABASE_SSL_MODE,
      statementTimeoutMs: parsed.DATABASE_STATEMENT_TIMEOUT_MS,
    },
  };
}
