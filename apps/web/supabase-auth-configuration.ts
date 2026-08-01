import "server-only";

import {
  resolveSupabaseAuthConfiguration,
  type SupabaseAuthRuntimeConfiguration,
} from "@support/supabase/auth";
import { z } from "zod";

const environmentSchema = z.object({
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
});

export type WebAuthenticationConfiguration = Readonly<{
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
  const url = optionalNonEmpty(parsed.SUPABASE_URL);
  const publishableKey = optionalNonEmpty(parsed.SUPABASE_PUBLISHABLE_KEY);
  if (url === undefined || publishableKey === undefined) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required.",
    );
  }
  return {
    provider: "supabase",
    supabase: resolveSupabaseAuthConfiguration({
      publishableKey,
      url,
    }),
  };
}
