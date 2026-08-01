import { enterpriseMembershipsServerFacade } from "./composition/enterprise-memberships.composition";

export type { EnterpriseAffiliation } from "./contracts/enterprise-affiliation";

export const listActiveEnterpriseAffiliationsForAccount =
  enterpriseMembershipsServerFacade.listActiveEnterpriseAffiliationsForAccount;
