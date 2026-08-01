import "server-only";

import { runPostgresMigrations } from "@support/database/postgres";

import { productionPostgresMigrations } from "./database-migrations";
import {
  closeProductionDatabase,
  getProductionDatabase,
} from "./production-runtime";

async function main(): Promise<void> {
  const database = getProductionDatabase();
  if (database === null) {
    throw new Error(
      "SUPPORT_RUNTIME_MODE must be postgres before running migrations.",
    );
  }
  try {
    await runPostgresMigrations(database, productionPostgresMigrations);
  } finally {
    await closeProductionDatabase();
  }
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Database migration failed.",
  );
  process.exitCode = 1;
});
