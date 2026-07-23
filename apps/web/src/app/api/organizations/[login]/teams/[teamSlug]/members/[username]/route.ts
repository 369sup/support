import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { resolveTeamRouteContext } from "@/app/_organization-administration/team-route-context";
import {
  getAccountReferenceById,
  getPersonalAccountByUsername,
} from "@/modules/identity/accounts/server-api";
import {
  addTeamMember,
  removeTeamMember,
} from "@/modules/organizations/organization-teams/server-api";

type RouteContext = {
  params: Promise<{ login: string; teamSlug: string; username: string }>;
};

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
  if (personalAccount.ok) {
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

export async function PUT(request: Request, context: RouteContext) {
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
  const result = await addTeamMember({
    actorAccountId: input.team.session.account.accountId,
    teamId: input.team.team.teamId,
    targetAccountId: input.account.accountId,
  });
  let status = 400;
  if (result.status === "added") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  } else if (result.status === "already-team-member") {
    status = 409;
  }
  return NextResponse.json(result, { status });
}

export async function DELETE(request: Request, context: RouteContext) {
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
  const result = await removeTeamMember({
    actorAccountId: input.team.session.account.accountId,
    teamId: input.team.team.teamId,
    targetAccountId: input.account.accountId,
  });
  let status = 404;
  if (result.status === "removed") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  }
  return NextResponse.json(result, { status });
}
