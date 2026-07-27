import { repositoriesServerFacade } from "./composition/repositories.composition";

export const archiveRepository =
  repositoriesServerFacade.archiveRepository;
export const changeRepositoryVisibility =
  repositoriesServerFacade.changeRepositoryVisibility;
export const createEmptyRepository =
  repositoriesServerFacade.createEmptyRepository;
export const deleteRepository =
  repositoriesServerFacade.deleteRepository;
export type {
  RepositoryCandidateReference,
  RepositoryLookupResult,
  RepositoryOwnerReference,
} from "./contracts/repository-reference";
export type { PublicRepositorySummary } from "./contracts/repository-summary";
export const getRepositoryByOwnerAndName =
  repositoriesServerFacade.getRepositoryByOwnerAndName;
export const getRepositoryForAdministration =
  repositoriesServerFacade.getRepositoryForAdministration;
export const listActivePublicRepositoriesForOrganizationOwner =
  repositoriesServerFacade.listActivePublicRepositoriesForOrganizationOwner;
export const listActivePublicRepositoriesForPersonalOwner =
  repositoriesServerFacade.listActivePublicRepositoriesForPersonalOwner;
export const listActiveRepositoriesForOwner =
  repositoriesServerFacade.listActiveRepositoriesForOwner;
export const renameRepository =
  repositoriesServerFacade.renameRepository;
export const restoreDeletedRepository =
  repositoriesServerFacade.restoreDeletedRepository;
export const unarchiveRepository =
  repositoriesServerFacade.unarchiveRepository;
export const updateRepositoryProfile =
  repositoriesServerFacade.updateRepositoryProfile;
