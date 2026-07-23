import { NextResponse } from "next/server";

import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { listActivePublicRepositoriesForOrganizationOwner } from "@/modules/repositories/repositories/server-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> },
) {
  const organization = await getOrganizationByLogin(
    (await context.params).login,
  );
  if (organization.status !== "found") {
    return NextResponse.json(organization, { status: 404 });
  }
  return NextResponse.json({
    status: "found",
    repositories:
      await listActivePublicRepositoriesForOrganizationOwner({
        organizationId: organization.organization.organizationId,
        login: organization.organization.login,
      }),
  });
}
