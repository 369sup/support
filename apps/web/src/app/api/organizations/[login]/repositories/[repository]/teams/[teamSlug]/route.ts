import { NextResponse } from "next/server";
import { z } from "zod";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { resolveOrganizationRouteContext } from "@/app/_organization-administration/route-context";
import { getOrganizationTeam } from "@/modules/organizations/organization-teams/server-api";
import { getRepositoryByOwnerAndName } from "@/modules/repositories/repositories/server-api";
import {
  changeTeamRepositoryAccess,
  grantTeamRepositoryAccess,
  revokeTeamRepositoryAccess,
} from "@/modules/repositories/repository-access/server-api";

const permissionSchema = z.object({
  permission: z.enum(["read", "triage", "write", "maintain", "admin"]),
});

type RouteContext = {
  params: Promise<{
    login: string;
    repository: string;
    teamSlug: string;
  }>;
};

async function resolveInput(context: RouteContext) {
  const params = await context.params;
  const resolved = await resolveOrganizationRouteContext(params.login);
  if (resolved.status !== "resolved") {
    return resolved;
  }
  const [repository, team] = await Promise.all([
    getRepositoryByOwnerAndName(
      resolved.organization.organizationId,
      params.repository,
    ),
    getOrganizationTeam({
      actorAccountId: resolved.session.account.accountId,
      organizationId: resolved.organization.organizationId,
      teamSlug: params.teamSlug,
    }),
  ]);
  if (
    repository.status !== "found" ||
    repository.repository.owner.kind !== "organization" ||
    repository.repository.owner.organizationId !==
      resolved.organization.organizationId
  ) {
    return { status: "repository-not-found" as const };
  }
  if (team.status !== "found") {
    return { status: "team-not-found" as const };
  }
  return {
    status: "resolved" as const,
    session: resolved.session,
    repository: repository.repository,
    team: team.team,
  };
}

function unresolved(status: string) {
  return NextResponse.json(
    { status },
    { status: status === "authentication-required" ? 401 : 404 },
  );
}

function resultStatus(status: string, success: string) {
  if (status === success) {
    return 200;
  }
  if (status === "permission-denied") {
    return 403;
  }
  if (
    status === "team-grant-conflict" ||
    status === "inherited-access-cannot-be-removed"
  ) {
    return 409;
  }
  return 404;
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
  const parsed = permissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const result = await grantTeamRepositoryAccess({
    actor: input.session.account,
    repository: input.repository,
    teamId: input.team.teamId,
    permission: parsed.data.permission,
  });
  return NextResponse.json(result, {
    status: result.status === "granted" ? 201 : resultStatus(result.status, ""),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
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
  const parsed = permissionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const result = await changeTeamRepositoryAccess({
    actor: input.session.account,
    repository: input.repository,
    teamId: input.team.teamId,
    permission: parsed.data.permission,
  });
  return NextResponse.json(result, {
    status: resultStatus(result.status, "changed"),
  });
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
  const result = await revokeTeamRepositoryAccess({
    actor: input.session.account,
    repository: input.repository,
    teamId: input.team.teamId,
  });
  return NextResponse.json(result, {
    status: resultStatus(result.status, "revoked"),
  });
}
