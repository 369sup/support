import { NextResponse } from "next/server";

import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  getEnterpriseBySlug,
  listEnterpriseOrganizations,
} from "@/modules/enterprises/enterprises/server-api";

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
