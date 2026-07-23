import type { TeamRepositoryGrantReference } from "../../../domain/repository-permission";

export type RevokeTeamRepositoryAccessCommand = Readonly<{
  actorAccountId: string;
  repository: Readonly<{
    repositoryId: string;
    owner:
      | Readonly<{ kind: "personal"; accountId: string }>
      | Readonly<{ kind: "organization"; organizationId: string }>;
    visibility: "public" | "private" | "internal";
  }>;
  teamId: string;
}>;

export type RevokeTeamRepositoryAccessResult =
  | Readonly<{ status: "revoked"; grant: TeamRepositoryGrantReference }>
  | Readonly<{
      status:
        | "permission-denied"
        | "repository-not-organization-owned"
        | "team-not-eligible"
        | "team-grant-not-found"
        | "inherited-access-cannot-be-removed";
    }>;

export interface RevokeTeamRepositoryAccessUseCase {
  revokeTeamRepositoryAccess(
    command: RevokeTeamRepositoryAccessCommand,
  ): Promise<RevokeTeamRepositoryAccessResult>;
}
