import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import {
  getAccountReferenceById,
  getPersonalAccountByUsername,
} from "@/modules/identity/accounts/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import {
  assignTeamMaintainer,
  getOrganizationTeam,
  revokeTeamMaintainer,
} from "@/modules/organizations/organization-teams/server-api";

type RouteContext = {
  params: Promise<{ login: string; teamSlug: string; username: string }>;
};

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

async function resolveInput(context: RouteContext) {
  const params = await context.params;
  const [team, account] = await Promise.all([
    resolveTeamRouteContext(params.login, params.teamSlug),
    resolveAccount(params.username),
  ]);
  if (team.status !== "resolved") {
    return { status: team.status };
  }
  if (account === null) {
    return { status: "account-not-found" as const };
  }
  return {
    status: "resolved" as const,
    team,
    account,
  };
}

async function resolveAccount(identifier: string) {
  const personalAccount = await getPersonalAccountByUsername(identifier);
  if (personalAccount.isSuccessful) {
    return personalAccount.account;
  }
  const account = await getAccountReferenceById(identifier);
  return account.status === "found" ? account.account : null;
}

function unresolved(status: string) {
  return NextResponse.json(
    { status },
    { status: status === "authentication-required" ? 401 : 404 },
  );
}

export async function PUT(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const input = await resolveInput(context);
  if (input.status !== "resolved") {
    return unresolved(input.status);
  }
  const result = await assignTeamMaintainer({
    actorAccountId: input.team.session.account.accountId,
    teamId: input.team.team.teamId,
    targetAccountId: input.account.accountId,
  });
  let status = 404;
  if (result.status === "assigned") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  } else if (result.status === "already-team-maintainer") {
    status = 409;
  }
  return NextResponse.json(result, { status });
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const input = await resolveInput(context);
  if (input.status !== "resolved") {
    return unresolved(input.status);
  }
  const result = await revokeTeamMaintainer({
    actorAccountId: input.team.session.account.accountId,
    teamId: input.team.team.teamId,
    targetAccountId: input.account.accountId,
  });
  let status = 404;
  if (result.status === "revoked") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  }
  return NextResponse.json(result, { status });
}
