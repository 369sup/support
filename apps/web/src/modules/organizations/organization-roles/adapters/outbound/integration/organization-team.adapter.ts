import {
  listOrganizationTeams,
  resolveAccountTeamMemberships,
} from "@/modules/organizations/organization-teams/server-api";

import type { OrganizationTeamGatewayPort } from "../../../application/ports/outbound/organization-team.gateway.port";

export class OrganizationTeamAdapter implements OrganizationTeamGatewayPort {
  async isActiveTeam(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }) {
    const result = await listOrganizationTeams({
      actorAccountId: input.actorAccountId,
      organizationId: input.organizationId,
    });
    return (
      result.status === "found" &&
      result.teams.some(
        (team) =>
          team.teamId === input.teamId && team.lifecycleState === "active",
      )
    );
  }

  async listDirectTeamIdsForAccount(
    accountId: string,
    organizationId: string,
  ) {
    const memberships = await resolveAccountTeamMemberships({
      accountId,
      organizationId,
    });
    return memberships.map((item) => item.membership.teamId);
  }
}
