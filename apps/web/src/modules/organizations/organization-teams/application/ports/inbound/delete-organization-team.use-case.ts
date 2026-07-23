import type { OrganizationTeamReference } from "../../../contracts/organization-team-reference";

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
