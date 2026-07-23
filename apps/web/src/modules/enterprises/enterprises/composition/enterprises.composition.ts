import { OrganizationReferenceAdapter } from "../adapters/outbound/integration/organization-reference.adapter";
import { InMemoryEnterpriseQueryAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-query.adapter";
import { GetEnterpriseBySlugHandler } from "../application/queries/get-enterprise-by-slug.handler";
import { ListEnterpriseOrganizationsHandler } from "../application/queries/list-enterprise-organizations.handler";
import type {
  EnterpriseLookupResult,
  EnterpriseOrganizationsResult,
} from "../contracts/enterprise-reference";

export interface EnterprisesServerFacade {
  getEnterpriseBySlug: (slug: string) => Promise<EnterpriseLookupResult>;
  listEnterpriseOrganizations: (
    slug: string,
  ) => Promise<EnterpriseOrganizationsResult>;
}

function composeEnterprisesServerFacade(): EnterprisesServerFacade {
  const repository = new InMemoryEnterpriseQueryAdapter();
  const organizationGateway = new OrganizationReferenceAdapter();
  const getBySlug = new GetEnterpriseBySlugHandler(repository);
  const listOrganizations = new ListEnterpriseOrganizationsHandler(
    repository,
    organizationGateway,
  );

  return {
    getEnterpriseBySlug: (slug) => getBySlug.getEnterpriseBySlug({ slug }),
    listEnterpriseOrganizations: (slug) =>
      listOrganizations.listEnterpriseOrganizations({ slug }),
  };
}

export const enterprisesServerFacade =
  composeEnterprisesServerFacade();
