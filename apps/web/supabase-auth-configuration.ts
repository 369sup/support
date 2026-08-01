import "server-only";

import {
  resolveSupabaseAuthConfiguration,
  type SupabaseAuthRuntimeConfiguration,
} from "@support/supabase/auth";
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_PROVIDER: z.enum(["postgres", "supabase"]).default("postgres"),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPPORT_RUNTIME_MODE: z.enum(["memory", "postgres"]).default("memory"),
});

export type WebAuthenticationConfiguration =
  | Readonly<{ provider: "unavailable" }>
  | Readonly<{
      provider: "supabase";
      supabase: SupabaseAuthRuntimeConfiguration;
    }>;

function optionalNonEmpty(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized === undefined || normalized === ""
    ? undefined
    : normalized;
}

export function resolveWebAuthenticationConfiguration(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): WebAuthenticationConfiguration {
  const parsed = environmentSchema.parse(environment);
  if (
    parsed.SUPPORT_RUNTIME_MODE !== "postgres" ||
    parsed.DATABASE_PROVIDER !== "supabase"
  ) {
    return { provider: "unavailable" };
  }
  const url = optionalNonEmpty(parsed.SUPABASE_URL);
  const publishableKey = optionalNonEmpty(parsed.SUPABASE_PUBLISHABLE_KEY);
  if (url === undefined || publishableKey === undefined) {
    return { provider: "unavailable" };
  }
  return {
    provider: "supabase",
    supabase: resolveSupabaseAuthConfiguration({
      publishableKey,
      url,
    }),
  };
}
