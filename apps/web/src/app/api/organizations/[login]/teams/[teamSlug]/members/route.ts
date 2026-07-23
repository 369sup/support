import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import {
  getOrganizationTeam,
  listTeamMembers,
} from "@/modules/organizations/organization-teams/server-api";

async function resolveTeamRouteContext(
  login: string,
  teamSlug: string,
) {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return { status: "authentication-required" as const };
  }
  const organization = await getOrganizationByLogin(login);
  if (organization.status !== "found") {
    return { status: "organization-not-found" as const };
  }
  const team = await getOrganizationTeam({
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
    teamSlug,
  });
  return team.status === "found"
    ? {
        status: "resolved" as const,
        session,
        organization: organization.organization,
        team: team.team,
      }
    : { status: "team-not-found" as const };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string; teamSlug: string }> },
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  const params = await context.params;
  const resolved = await resolveTeamRouteContext(
    params.login,
    params.teamSlug,
  );
  if (resolved.status !== "resolved") {
    return NextResponse.json(resolved, {
      status:
        resolved.status === "authentication-required" ? 401 : 404,
    });
  }
  const result = await listTeamMembers({
    actorAccountId: resolved.session.account.accountId,
    teamId: resolved.team.teamId,
  });
  return NextResponse.json(result, {
    status: result.status === "found" ? 200 : 404,
  });
}
