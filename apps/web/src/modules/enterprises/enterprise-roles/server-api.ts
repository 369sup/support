import { enterpriseRolesServerFacade } from "./composition/enterprise-roles.composition";

export type { EnterpriseAdministrationDecision } from "./contracts/enterprise-administration-decision";

export const authorizeEnterpriseAdministration =
  enterpriseRolesServerFacade.authorizeEnterpriseAdministration;
