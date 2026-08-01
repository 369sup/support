import type {
  SqlRow,
  TransactionalSqlExecutor,
} from "@support/database/postgres";
import { z } from "zod";
import type { CustomPropertyRepositoryPort } from "../../../application/ports/outbound/custom-property.repository.port";
import type {
  CustomPropertyValue,
  OrganizationRepositoryPropertyDefinition,
  RepositoryPropertyValue,
} from "../../../domain/custom-property";

type DefinitionRow = SqlRow & {
  property_id: string;
  organization_id: string;
  name: string;
  description: string;
  value_type: OrganizationRepositoryPropertyDefinition["valueType"];
  allowed_values_json: string;
  default_value_json: string | null;
  isRequired: boolean;
  isExplicitValueRequired: boolean;
  canRepositoryActorsSet: boolean;
};

const customPropertyValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()).readonly(),
  z.null(),
]);

function parseValue(value: string | null): CustomPropertyValue {
  if (value === null) {
    return null;
  }
  const parsed: unknown = JSON.parse(value);
  return customPropertyValueSchema.parse(parsed);
}

function parseAllowedValues(value: string): readonly string[] {
  const parsed: unknown = JSON.parse(value);
  return z.array(z.string()).readonly().parse(parsed);
}

function mapDefinition(
  row: DefinitionRow,
): OrganizationRepositoryPropertyDefinition {
  return {
    propertyId: row.property_id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    valueType: row.value_type,
    allowedValues: parseAllowedValues(row.allowed_values_json),
    defaultValue: parseValue(row.default_value_json),
    isRequired: row.isRequired,
    isExplicitValueRequired: row.isExplicitValueRequired,
    canRepositoryActorsSet: row.canRepositoryActorsSet,
  };
}

export class PostgresCustomPropertyAdapter
  implements CustomPropertyRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly isSchemaReady: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.isSchemaReady = this.assertSchema();
  }

  private async assertSchema(): Promise<void> {
    const result = await this.database.query<{ isReady: boolean }>(
      `select exists (
         select 1 from support_schema_migrations
         where migration_id = 'zz070_organizations_custom_properties'
       ) as "isReady"`,
    );
    if (result.rows[0]?.isReady !== true) {
      throw new Error("Custom property schema is unavailable.");
    }
  }

  async define(definition: OrganizationRepositoryPropertyDefinition) {
    await this.isSchemaReady;
    const result = await this.database.query(
      `insert into support_organization_repository_properties (
         property_id, organization_id, name, normalized_name, description,
         value_type, allowed_values, default_value, required,
         require_explicit_value, repository_actors_can_set
       ) values (
         $1, $2, $3, lower($3), $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10
       )
       on conflict (organization_id, normalized_name) do nothing`,
      [
        definition.propertyId,
        definition.organizationId,
        definition.name,
        definition.description,
        definition.valueType,
        JSON.stringify(definition.allowedValues),
        JSON.stringify(definition.defaultValue),
        definition.isRequired,
        definition.isExplicitValueRequired,
        definition.canRepositoryActorsSet,
      ],
    );
    return result.rowCount === 1 ? "defined" : "name-conflict";
  }

  async listDefinitions(organizationId: string) {
    await this.isSchemaReady;
    const result = await this.database.query<DefinitionRow>(
      `select property_id, organization_id, name, description, value_type,
              allowed_values::text as allowed_values_json,
              default_value::text as default_value_json,
              required as "isRequired",
              require_explicit_value as "isExplicitValueRequired",
              repository_actors_can_set as "canRepositoryActorsSet"
         from support_organization_repository_properties
        where organization_id = $1 order by name, property_id`,
      [organizationId],
    );
    return result.rows.map(mapDefinition);
  }

  async setRepositoryValues(
    repositoryIds: readonly string[],
    values: readonly RepositoryPropertyValue[],
    actorAccountId: string,
  ) {
    await this.isSchemaReady;
    const repositoryIdSet = new Set(repositoryIds);
    await this.database.transaction(async (connection) => {
      for (const value of values) {
        if (!repositoryIdSet.has(value.repositoryId)) {
          throw new Error("Repository value is outside the requested batch.");
        }
        await connection.query(
          `insert into support_repository_property_values (
             repository_id, property_id, value, source,
             updated_by_account_id, updated_at
           ) values ($1, $2, $3::jsonb, $4, $5, now())
           on conflict (repository_id, property_id) do update set
             value = excluded.value,
             source = excluded.source,
             updated_by_account_id = excluded.updated_by_account_id,
             updated_at = excluded.updated_at`,
          [
            value.repositoryId,
            value.propertyId,
            JSON.stringify(value.value),
            value.source,
            actorAccountId,
          ],
        );
      }
    });
  }

  async searchRepositoryIds(
    organizationId: string,
    propertyName: string,
    value: string,
  ) {
    await this.isSchemaReady;
    const encoded = JSON.stringify(value);
    const result = await this.database.query<{ repository_id: string }>(
      `select distinct values.repository_id
         from support_repository_property_values values
         join support_organization_repository_properties definitions
           on definitions.property_id = values.property_id
         join support_repositories repositories
           on repositories.repository_id = values.repository_id
        where definitions.organization_id = $1
          and definitions.normalized_name = lower($2)
          and (
            values.value = $3::jsonb
            or values.value @> jsonb_build_array($3::jsonb)
          )
          and repositories.lifecycle_state = 'active'
        order by values.repository_id`,
      [organizationId, propertyName, encoded],
    );
    return result.rows.map((row) => row.repository_id);
  }
}
