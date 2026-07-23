import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { resolveTeamRouteContext } from "@/app/_organization-administration/team-route-context";
import { listTeamMembers } from "@/modules/organizations/organization-teams/server-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string; teamSlug: string }> },
) {
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
