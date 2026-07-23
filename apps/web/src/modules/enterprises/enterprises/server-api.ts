import { enterprisesServerFacade } from "./composition/enterprises.composition";

export type {
  EnterpriseLookupResult,
  EnterpriseOrganizationsResult,
  EnterpriseReference,
} from "./contracts/enterprise-reference";

export const getEnterpriseBySlug =
  enterprisesServerFacade.getEnterpriseBySlug;
export const listEnterpriseOrganizations =
  enterprisesServerFacade.listEnterpriseOrganizations;
