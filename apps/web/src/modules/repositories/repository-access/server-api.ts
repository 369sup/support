import { repositoryAccessServerFacade } from "./composition/repository-access.composition";

export type {
  EffectiveRepositoryPermissionDecision,
  RepositoryPermission,
  RepositoryPermissionSource,
  TeamRepositoryGrantReference,
} from "./contracts/effective-repository-permission-decision";

export const changeTeamRepositoryAccess =
  repositoryAccessServerFacade.changeTeamRepositoryAccess;
export const grantTeamRepositoryAccess =
  repositoryAccessServerFacade.grantTeamRepositoryAccess;
export const resolveEffectiveRepositoryPermission =
  repositoryAccessServerFacade.resolveEffectiveRepositoryPermission;
export const revokeTeamRepositoryAccess =
  repositoryAccessServerFacade.revokeTeamRepositoryAccess;
