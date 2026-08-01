import { getProductionDatabase } from "../../../../../production-runtime";
import { InMemoryCustomPropertyAdapter } from "../adapters/outbound/persistence/in-memory-custom-property.adapter";
import { NodeCustomPropertyIdGeneratorAdapter } from "../adapters/outbound/persistence/node-custom-property-id-generator.adapter";
import { PostgresCustomPropertyAdapter } from "../adapters/outbound/persistence/postgres-custom-property.adapter";
import { CustomPropertyService } from "../application/services/custom-property.service";
import { DefineOrganizationRepositoryPropertyHandler } from "../application/commands/define-organization-repository-property.handler";
import { SetRepositoryPropertyValuesHandler } from "../application/commands/set-repository-property-values.handler";
import { ListOrganizationRepositoryPropertiesHandler } from "../application/queries/list-organization-repository-properties.handler";
import { SearchRepositoriesByPropertyHandler } from "../application/queries/search-repositories-by-property.handler";

const database = getProductionDatabase();
const repository =
  database === null
    ? new InMemoryCustomPropertyAdapter()
    : new PostgresCustomPropertyAdapter(database);
const service = new CustomPropertyService(
  repository,
  new NodeCustomPropertyIdGeneratorAdapter(),
);
const define = new DefineOrganizationRepositoryPropertyHandler(service);
const list = new ListOrganizationRepositoryPropertiesHandler(service);
const search = new SearchRepositoriesByPropertyHandler(service);
const setValues = new SetRepositoryPropertyValuesHandler(service);

export const customPropertiesServerFacade = {
  defineOrganizationRepositoryProperty:
    define.defineOrganizationRepositoryProperty.bind(define),
  listOrganizationRepositoryProperties:
    list.listOrganizationRepositoryProperties.bind(list),
  searchRepositoriesByProperty:
    search.searchRepositoriesByProperty.bind(search),
  setRepositoryPropertyValues:
    setValues.setRepositoryPropertyValues.bind(setValues),
} as const;
