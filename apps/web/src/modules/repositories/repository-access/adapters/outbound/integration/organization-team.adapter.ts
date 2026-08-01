import {
  listOrganizationTeams,
  resolveAccountTeamMemberships,
} from "@/modules/organizations/organization-teams/server-api";

import type { OrganizationTeamGatewayPort } from "../../../application/ports/outbound/organization-team.gateway.port";

export class OrganizationTeamAdapter implements OrganizationTeamGatewayPort {
  async listAccountTeamPermissions(
    accountId: string,
    organizationId: string,
  ) {
    const memberships = await resolveAccountTeamMemberships({
      accountId,
      organizationId,
    });
    return memberships.map((item) => ({
      directTeamId: item.membership.teamId,
      ancestorTeamIds: item.ancestorTeamIds,
      isMaintainer: item.isMaintainer,
    }));
  }

  async getTeamForActor(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }) {
    const result = await listOrganizationTeams({
      actorAccountId: input.actorAccountId,
      organizationId: input.organizationId,
    });
    if (result.status !== "found") {
      return null;
    }
    const team = result.teams.find(
      (candidate) => candidate.teamId === input.teamId,
    );
    if (team === undefined || team.lifecycleState !== "active") {
      return null;
    }
    const actorMemberships = await resolveAccountTeamMemberships({
      accountId: input.actorAccountId,
      organizationId: input.organizationId,
    });
    return {
      teamId: team.teamId,
      organizationId: team.organizationId,
      parentTeamId: team.parentTeamId,
      isMaintainer:
        actorMemberships.find(
          (membership) => membership.membership.teamId === team.teamId,
        )?.isMaintainer ?? false,
    };
  }

  async listAncestorTeamIds(input: {
    actorAccountId: string;
    organizationId: string;
    teamId: string;
  }) {
    const result = await listOrganizationTeams({
      actorAccountId: input.actorAccountId,
      organizationId: input.organizationId,
    });
    if (result.status !== "found") {
      return [];
    }
    const byId = new Map(result.teams.map((team) => [team.teamId, team]));
    const ancestors: string[] = [];
    const visited = new Set<string>([input.teamId]);
    let parentTeamId = byId.get(input.teamId)?.parentTeamId ?? null;
    while (parentTeamId !== null && !visited.has(parentTeamId)) {
      const parent = byId.get(parentTeamId);
      if (parent === undefined || parent.lifecycleState !== "active") {
        break;
      }
      ancestors.push(parent.teamId);
      visited.add(parent.teamId);
      parentTeamId = parent.parentTeamId;
    }
    return ancestors;
  }
}
