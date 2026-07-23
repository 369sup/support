import { repositoriesServerFacade } from "./composition/repositories.composition";

export type {
  RepositoryCandidateReference,
  RepositoryLookupResult,
  RepositoryOwnerReference,
} from "./contracts/repository-reference";
export type { PublicRepositorySummary } from "./contracts/repository-summary";
export const getRepositoryByOwnerAndName =
  repositoriesServerFacade.getRepositoryByOwnerAndName;
export const listActivePublicRepositoriesForOrganizationOwner =
  repositoriesServerFacade.listActivePublicRepositoriesForOrganizationOwner;
export const listActivePublicRepositoriesForPersonalOwner =
  repositoriesServerFacade.listActivePublicRepositoriesForPersonalOwner;
export const listActiveRepositoriesForOwner =
  repositoriesServerFacade.listActiveRepositoriesForOwner;
