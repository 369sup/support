import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { resolveOrganizationRouteContext } from "@/app/_organization-administration/route-context";
import { listPredefinedOrganizationRoles } from "@/modules/organizations/organization-roles/server-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> },
) {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  const resolved = await resolveOrganizationRouteContext(
    (await context.params).login,
  );
  if (resolved.status !== "resolved") {
    return NextResponse.json(resolved, {
      status:
        resolved.status === "authentication-required" ? 401 : 404,
    });
  }
  const result = await listPredefinedOrganizationRoles({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
  });
  return NextResponse.json(result, {
    status: result.status === "found" ? 200 : 403,
  });
}
