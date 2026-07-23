import { organizationsServerFacade } from "./composition/organizations.composition";

export type {
  OrganizationLookupResult,
  OrganizationOwnerReference,
  OrganizationReference,
} from "./contracts/organization-reference";

export const getOrganizationByLogin =
  organizationsServerFacade.getOrganizationByLogin;
export const getOrganizationReferenceById =
  organizationsServerFacade.getOrganizationReferenceById;
