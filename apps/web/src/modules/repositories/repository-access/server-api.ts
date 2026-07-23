import { repositoryAccessServerFacade } from "./composition/repository-access.composition";

export type {
  EffectiveRepositoryPermissionDecision,
  RepositoryPermission,
  RepositoryPermissionSource,
} from "./contracts/effective-repository-permission-decision";

export const resolveEffectiveRepositoryPermission =
  repositoryAccessServerFacade.resolveEffectiveRepositoryPermission;
