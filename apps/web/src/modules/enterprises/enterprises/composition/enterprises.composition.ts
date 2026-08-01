import { OrganizationReferenceAdapter } from "../adapters/outbound/integration/organization-reference.adapter";
import { InMemoryEnterpriseQueryAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-query.adapter";
import { NodeEnterpriseIdGeneratorAdapter } from "../adapters/outbound/persistence/node-enterprise-id-generator.adapter";
import { PostgresEnterpriseQueryAdapter } from "../adapters/outbound/persistence/postgres-enterprise-query.adapter";
import { CreateEnterpriseHandler } from "../application/commands/create-enterprise.handler";
import { AttachEnterpriseOrganizationHandler } from "../application/commands/attach-enterprise-organization.handler";
import type { AttachEnterpriseOrganizationUseCase } from "../application/ports/inbound/attach-enterprise-organization.use-case";
import type { CreateEnterpriseUseCase } from "../application/ports/inbound/create-enterprise.use-case";
import { GetEnterpriseBySlugHandler } from "../application/queries/get-enterprise-by-slug.handler";
import { ListEnterpriseOrganizationsHandler } from "../application/queries/list-enterprise-organizations.handler";
import type {
  EnterpriseLookupResult,
  EnterpriseOrganizationsResult,
} from "../contracts/enterprise-reference";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface EnterprisesServerFacade {
  attachEnterpriseOrganization: AttachEnterpriseOrganizationUseCase["attachEnterpriseOrganization"];
  createEnterprise: CreateEnterpriseUseCase["createEnterprise"];
  getEnterpriseBySlug: (slug: string) => Promise<EnterpriseLookupResult>;
  listEnterpriseOrganizations: (
    slug: string,
  ) => Promise<EnterpriseOrganizationsResult>;
}

function composeEnterprisesServerFacade(): EnterprisesServerFacade {
  const database = getProductionDatabase();
  const repository =
    database === null
      ? new InMemoryEnterpriseQueryAdapter()
      : new PostgresEnterpriseQueryAdapter(database);
  const organizationGateway = new OrganizationReferenceAdapter();
  const create = new CreateEnterpriseHandler(
    repository,
    new NodeEnterpriseIdGeneratorAdapter(),
  );
  const attachOrganization =
    new AttachEnterpriseOrganizationHandler(repository);
  const getBySlug = new GetEnterpriseBySlugHandler(repository);
  const listOrganizations = new ListEnterpriseOrganizationsHandler(
    repository,
    organizationGateway,
  );

  return {
    attachEnterpriseOrganization: (command) =>
      attachOrganization.attachEnterpriseOrganization(command),
    createEnterprise: (command) => create.createEnterprise(command),
    getEnterpriseBySlug: (slug) => getBySlug.getEnterpriseBySlug({ slug }),
    listEnterpriseOrganizations: (slug) =>
      listOrganizations.listEnterpriseOrganizations({ slug }),
  };
}

export const enterprisesServerFacade =
  composeEnterprisesServerFacade();
