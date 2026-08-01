import type { OrganizationTeamReference } from "../../../domain/organization-team";

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
