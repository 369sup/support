import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { resolveOrganizationRouteContext } from "@/app/_organization-administration/route-context";
import { revokeOrganizationRole } from "@/modules/organizations/organization-roles/server-api";

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ login: string; assignmentId: string }>;
  },
) {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const params = await context.params;
  const resolved = await resolveOrganizationRouteContext(params.login);
  if (resolved.status !== "resolved") {
    return NextResponse.json(resolved, {
      status:
        resolved.status === "authentication-required" ? 401 : 404,
    });
  }
  const result = await revokeOrganizationRole({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
    assignmentId: params.assignmentId,
  });
  let status = 404;
  if (result.status === "revoked") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  }
  return NextResponse.json(result, { status });
}
