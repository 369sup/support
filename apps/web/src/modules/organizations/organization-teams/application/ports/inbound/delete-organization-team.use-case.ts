import type { OrganizationTeamReference } from "../../../domain/organization-team";

export type DeleteOrganizationTeamCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
}>;

export type DeleteOrganizationTeamResult =
  | Readonly<{ status: "deleted"; team: OrganizationTeamReference }>
  | Readonly<{ status: "team-not-found" | "permission-denied" }>;

export interface DeleteOrganizationTeamUseCase {
  deleteOrganizationTeam(
    command: DeleteOrganizationTeamCommand,
  ): Promise<DeleteOrganizationTeamResult>;
}
