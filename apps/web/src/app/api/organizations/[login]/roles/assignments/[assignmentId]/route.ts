import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { revokeOrganizationRole } from "@/modules/organizations/organization-roles/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

async function resolveOrganizationRouteContext(login: string) {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return { status: "authentication-required" as const };
  }
  const organization = await getOrganizationByLogin(login);
  if (organization.status !== "found") {
    return { status: "organization-not-found" as const };
  }
  return {
    status: "resolved" as const,
    session,
    organization: organization.organization,
  };
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ login: string; assignmentId: string }>;
  },
): Promise<Response> {
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
