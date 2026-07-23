import type { OrganizationTeamReference } from "../../../contracts/organization-team-reference";

export type ListOrganizationTeamsQuery = Readonly<{
  actorAccountId: string;
  organizationId: string;
}>;

export type ListOrganizationTeamsResult =
  | Readonly<{
      status: "found";
      teams: readonly OrganizationTeamReference[];
    }>
  | Readonly<{ status: "membership-inactive" }>;

export interface ListOrganizationTeamsUseCase {
  listOrganizationTeams(
    query: ListOrganizationTeamsQuery,
  ): Promise<ListOrganizationTeamsResult>;
}
