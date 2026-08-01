import { NextResponse } from "next/server";

import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  attachEnterpriseOrganization,
  getEnterpriseBySlug,
  listEnterpriseOrganizations,
} from "@/modules/enterprises/enterprises/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return NextResponse.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }
  const enterprise = await getEnterpriseBySlug((await context.params).slug);
  if (enterprise.status !== "found") {
    return NextResponse.json(enterprise, { status: 404 });
  }
  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (decision.status !== "allowed") {
    return NextResponse.json(decision, { status: 403 });
  }
  return NextResponse.json(
    await listEnterpriseOrganizations(enterprise.enterprise.slug),
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return NextResponse.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }
  const enterprise = await getEnterpriseBySlug((await context.params).slug);
  if (enterprise.status !== "found") {
    return NextResponse.json(enterprise, { status: 404 });
  }
  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (decision.status !== "allowed") {
    return NextResponse.json(decision, { status: 403 });
  }
  const body: unknown = await request.json().catch(() => null);
  const organizationLogin =
    typeof body === "object" &&
    body !== null &&
    "organizationLogin" in body &&
    typeof body.organizationLogin === "string"
      ? body.organizationLogin
      : "";
  const organization = await getOrganizationByLogin(organizationLogin);
  if (organization.status !== "found") {
    return NextResponse.json(
      { status: "organization-not-found" },
      { status: 404 },
    );
  }
  const result = await attachEnterpriseOrganization({
    enterpriseId: enterprise.enterprise.enterpriseId,
    organizationId: organization.organization.organizationId,
  });
  return NextResponse.json(result, {
    status: result.status === "attached" ? 201 : 409,
  });
}
