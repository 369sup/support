import { enterprisesServerFacade } from "./composition/enterprises.composition";

export type {
  EnterpriseLookupResult,
  EnterpriseOrganizationsResult,
  EnterpriseReference,
} from "./contracts/enterprise-reference";
export const attachEnterpriseOrganization =
  enterprisesServerFacade.attachEnterpriseOrganization;
export const createEnterprise =
  enterprisesServerFacade.createEnterprise;
export const getEnterpriseBySlug =
  enterprisesServerFacade.getEnterpriseBySlug;
export const listEnterpriseOrganizations =
  enterprisesServerFacade.listEnterpriseOrganizations;
