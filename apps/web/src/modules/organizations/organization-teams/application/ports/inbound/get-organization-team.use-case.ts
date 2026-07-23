import type { OrganizationTeamReference } from "../../../contracts/organization-team-reference";

export type GetOrganizationTeamQuery = Readonly<{
  actorAccountId: string;
  organizationId: string;
  teamSlug: string;
}>;

export type GetOrganizationTeamResult =
  | Readonly<{ status: "found"; team: OrganizationTeamReference }>
  | Readonly<{ status: "team-not-found" }>;

export interface GetOrganizationTeamUseCase {
  getOrganizationTeam(
    query: GetOrganizationTeamQuery,
  ): Promise<GetOrganizationTeamResult>;
}
