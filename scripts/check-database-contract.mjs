import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const moduleMap = JSON.parse(
  await readFile(path.join(repositoryRoot, "docs/architecture/module-map.json"), "utf8"),
);
const objectMap = JSON.parse(
  await readFile(path.join(repositoryRoot, "supabase/schema-object-map.json"), "utf8"),
);
const config = await readFile(
  path.join(repositoryRoot, "supabase/config.toml"),
  "utf8",
);
const schemaDirectory = path.join(repositoryRoot, "supabase/schemas");
const schemaFiles = (await readdir(schemaDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const migrationDirectory = path.join(repositoryRoot, "supabase/migrations");
const migrationFiles = (await readdir(migrationDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const sqlByFile = new Map();
for (const schemaFile of schemaFiles) {
  sqlByFile.set(
    schemaFile,
    await readFile(path.join(schemaDirectory, schemaFile), "utf8"),
  );
}
const sql = [...sqlByFile.values()].join("\n");
const migrationSql = (
  await Promise.all(
    migrationFiles.map((file) =>
      readFile(path.join(migrationDirectory, file), "utf8"),
    ),
  )
).join("\n");
const errors = [];

const contexts = new Map(
  moduleMap.contexts.map((context) => [
    `${context.subdomain}/${context.name}`,
    context.implementationStatus,
  ]),
);
const mappedObjects = new Set();
const mappedSchemas = new Set();
const catalogPlannedContexts = [...contexts]
  .filter(([, status]) => status === "planned")
  .map(([context]) => context)
  .sort();
const mappedPlannedContexts = [...objectMap.plannedContexts].sort();
if (
  JSON.stringify(catalogPlannedContexts) !==
  JSON.stringify(mappedPlannedContexts)
) {
  errors.push("planned context inventory differs from module-map.json");
}
const catalogActiveContexts = [...contexts]
  .filter(([, status]) => status === "active")
  .map(([context]) => context)
  .sort();
const mappedActiveContexts = objectMap.active
  .map((entry) => entry.context)
  .sort();
if (
  JSON.stringify(catalogActiveContexts) !==
  JSON.stringify(mappedActiveContexts)
) {
  const missing = catalogActiveContexts.filter(
    (context) => !mappedActiveContexts.includes(context),
  );
  const extra = mappedActiveContexts.filter(
    (context) => !catalogActiveContexts.includes(context),
  );
  errors.push(
    `active context inventory differs from module-map.json (missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"})`,
  );
}

for (const entry of objectMap.active) {
  const status = contexts.get(entry.context);
  if (status !== "active") {
    errors.push(
      `${entry.context} owns SQL but module-map status is ${status ?? "missing"}`,
    );
  }
  if (!/^support_[a-z0-9_]+$/.test(entry.schema)) {
    errors.push(`${entry.context} has invalid schema ${entry.schema}`);
  }
  if (!sql.includes(`create schema if not exists ${entry.schema};`)) {
    errors.push(`${entry.schema} is mapped but not declared`);
  }
  mappedSchemas.add(entry.schema);
  for (const object of entry.objects) {
    if (mappedObjects.has(object)) {
      errors.push(`${object} is mapped more than once`);
    }
    mappedObjects.add(object);
    if (!sql.includes(object)) {
      errors.push(`${entry.schema}.${object} is mapped but absent from SQL`);
    }
  }
}

const expectedRelationNames = new Set(
  objectMap.active.flatMap((entry) =>
    entry.objects.map((object) => `${entry.schema}.${object}`),
  ),
);
const applicationDirectory = path.join(repositoryRoot, "apps/web");
const applicationFiles = (await readdir(applicationDirectory, {
  recursive: true,
}))
  .filter(
    (file) =>
      /\.(?:ts|tsx)$/.test(file) &&
      !file.includes("node_modules") &&
      !file.startsWith(".next"),
  );
const relationReferencePattern = /(?:delete\s+from|from|into|join|update)\s+(support_[a-z0-9_]+(?:\.[a-z0-9_]+)?)/gi;
for (const applicationFile of applicationFiles) {
  const source = await readFile(
    path.join(applicationDirectory, applicationFile),
    "utf8",
  );
  for (const match of source.matchAll(relationReferencePattern)) {
    const relationName = match[1];
    if (relationName === "support_private.schema_contract") {
      continue;
    }
    if (!expectedRelationNames.has(relationName)) {
      errors.push(
        `${applicationFile} references unowned or unqualified relation ${relationName}`,
      );
    }
  }
}

for (const [context, status] of contexts) {
  if (status !== "planned") {
    continue;
  }
  const [subdomain, name] = context.split("/");
  const forbiddenSchema = `support_${subdomain}_${name.replaceAll("-", "_")}`;
  if (sql.includes(forbiddenSchema)) {
    errors.push(`planned context ${context} leaked into declarative SQL`);
  }
}

const relationPattern = /create\s+(?:or\s+replace\s+)?(?:table|view)\s+(?:if\s+not\s+exists\s+)?(?:support_[a-z0-9_]+\.)?(support_[a-z0-9_]+)(?=[\s(])/gi;
for (const match of sql.matchAll(relationPattern)) {
  const object = match[1];
  if (object === "schema_contract") {
    continue;
  }
  if (!mappedObjects.has(object)) {
    errors.push(`${object} is declared but has no active context mapping`);
  }
}

if (sql.includes("support_schema_migrations")) {
  errors.push("custom migration ledger leaked into declarative SQL");
}

const configuredSchemaFiles = [...config.matchAll(/"\.\/schemas\/([^"\n]+\.sql)"/g)]
  .map((match) => match[1]);
if (JSON.stringify(configuredSchemaFiles) !== JSON.stringify(schemaFiles)) {
  errors.push("config.toml schema_paths must list every schema file exactly once in dependency order");
}

if (objectMap.contractVersion !== "2026-08-01.v1") {
  errors.push("unexpected schema contract version");
}
if (
  !migrationSql.includes(
    `values ('support-web', '${objectMap.contractVersion}', now())`,
  )
) {
  errors.push("migration history does not publish the current schema contract version");
}

const allowedTextIds = new Set([
  "activity_id",
  "document_id",
  "session_id",
  "worker_id",
]);
const typedIdPattern = /^\s*([a-z][a-z0-9_]*_id)\s+([a-z][a-z0-9_]*(?:\([^)]*\))?)/gim;
for (const match of sql.matchAll(typedIdPattern)) {
  const column = match[1];
  const type = match[2].toLowerCase();
  if (type !== "uuid" && !allowedTextIds.has(column)) {
    errors.push(`${column} uses ${type}; internal IDs must use uuid`);
  }
}

const retiredMigrationSources = applicationFiles.filter(
  (file) => file.endsWith(".migrations.ts") || file === "database-migrations.ts",
);
if (retiredMigrationSources.length > 0) {
  errors.push(
    `retired TypeScript migration sources remain: ${retiredMigrationSources.join(", ")}`,
  );
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`database-contract: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `database-contract: ${mappedSchemas.size} active schemas and ${mappedObjects.size} objects verified`,
  );
}
