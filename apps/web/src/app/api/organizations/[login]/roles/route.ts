import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { listPredefinedOrganizationRoles } from "@/modules/organizations/organization-roles/server-api";
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> },
): Promise<Response> {
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
