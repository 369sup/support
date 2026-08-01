import "server-only";

import {
  createPostgresDatabase,
  type PostgresDatabase,
} from "@support/database/postgres";
import { createSupabasePostgresDatabase } from "@support/supabase/postgres";

import { resolveProductionRuntimeConfiguration } from "./production-runtime-configuration";

declare global {
  var __supportPostgresDatabaseV1: PostgresDatabase | undefined;
}

export function getProductionDatabase(): PostgresDatabase | null {
  const configuration = resolveProductionRuntimeConfiguration();
  if (configuration.mode === "memory") {
    return null;
  }
  globalThis.__supportPostgresDatabaseV1 ??=
    configuration.provider === "supabase"
      ? createSupabasePostgresDatabase(configuration.supabase)
      : createPostgresDatabase(configuration.postgres);
  return globalThis.__supportPostgresDatabaseV1;
}

export async function closeProductionDatabase(): Promise<void> {
  const database = globalThis.__supportPostgresDatabaseV1;
  if (database === undefined) {
    return;
  }
  globalThis.__supportPostgresDatabaseV1 = undefined;
  await database.close();
}
