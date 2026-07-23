import { getOrganizationTeam } from "@/modules/organizations/organization-teams/server-api";

import { resolveOrganizationRouteContext } from "./route-context";

export async function resolveTeamRouteContext(
  login: string,
  teamSlug: string,
) {
  const resolved = await resolveOrganizationRouteContext(login);
  if (resolved.status !== "resolved") {
    return resolved;
  }
  const team = await getOrganizationTeam({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
    teamSlug,
  });
  return team.status === "found"
    ? { ...resolved, team: team.team }
    : { status: "team-not-found" as const };
}
