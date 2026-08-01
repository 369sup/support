import type {
  RepositoryPermission,
  TeamRepositoryGrantReference,
} from "../../../domain/repository-permission";

export type ChangeTeamRepositoryAccessCommand = Readonly<{
  actorAccountId: string;
  repository: Readonly<{
    repositoryId: string;
    owner:
      | Readonly<{ kind: "personal"; accountId: string }>
      | Readonly<{ kind: "organization"; organizationId: string }>;
    visibility: "public" | "private" | "internal";
  }>;
  teamId: string;
  permission: RepositoryPermission;
}>;

export type ChangeTeamRepositoryAccessResult =
  | Readonly<{ status: "changed"; grant: TeamRepositoryGrantReference }>
  | Readonly<{
      status:
        | "permission-denied"
        | "repository-not-organization-owned"
        | "team-not-eligible"
        | "team-grant-not-found";
    }>;

export interface ChangeTeamRepositoryAccessUseCase {
  changeTeamRepositoryAccess(
    command: ChangeTeamRepositoryAccessCommand,
  ): Promise<ChangeTeamRepositoryAccessResult>;
}
