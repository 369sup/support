import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import objectMap from "../../supabase/schema-object-map.json";
import { supportDatabaseSchemaContractVersion } from "./database-schema-contract";

const repositoryRoot = resolve(import.meta.dirname, "..", "..");
const schemaDirectory = resolve(repositoryRoot, "supabase", "schemas");
const schemaSql = readdirSync(schemaDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(resolve(schemaDirectory, file), "utf8"))
  .join("\n");
describe("declarative database contract", () => {
  it("uses the application contract version", () => {
    expect(objectMap.contractVersion).toBe(
      supportDatabaseSchemaContractVersion,
    );
    expect(schemaSql).toContain("support_private.schema_contract");
  });

  it("maps every active object to its context schema", () => {
    for (const entry of objectMap.active) {
      expect(schemaSql).toContain(`create schema if not exists ${entry.schema}`);
      for (const object of entry.objects) {
        expect(schemaSql).toContain(object);
      }
    }
  });

  it("keeps the custom migration ledger out of desired state", () => {
    expect(schemaSql).not.toContain("support_schema_migrations");
  });

  it("denies browser and service roles on product schemas", () => {
    expect(schemaSql).toContain(
      "from public, anon, authenticated, service_role",
    );
    expect(schemaSql).toContain("force row level security");
    expect(schemaSql).toContain("to support_web_runtime");
  });
});
