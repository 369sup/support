import { NextResponse } from "next/server";
import { z } from "zod";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import {
  deleteOrganizationTeam,
  getOrganizationTeam,
  updateOrganizationTeam,
} from "@/modules/organizations/organization-teams/server-api";

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: z.string().trim().max(280).optional(),
    visibility: z.enum(["visible", "secret"]).optional(),
    parentTeamId: z.string().min(1).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

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

async function resolveTeam(login: string, teamSlug: string) {
  const resolved = await resolveOrganizationRouteContext(login);
  if (resolved.status !== "resolved") {
    return resolved;
  }
  const team = await getOrganizationTeam({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
    teamSlug,
  });
  return team.status === "found"
    ? { ...resolved, team: team.team }
    : { status: "team-not-found" as const };
}

function unresolvedResponse(status: string) {
  return NextResponse.json(
    { status },
    { status: status === "authentication-required" ? 401 : 404 },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string; teamSlug: string }> },
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  const params = await context.params;
  const resolved = await resolveTeam(params.login, params.teamSlug);
  return resolved.status === "resolved"
    ? NextResponse.json({ status: "found", team: resolved.team })
    : unresolvedResponse(resolved.status);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ login: string; teamSlug: string }> },
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const params = await context.params;
  const resolved = await resolveTeam(params.login, params.teamSlug);
  if (resolved.status !== "resolved") {
    return unresolvedResponse(resolved.status);
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const result = await updateOrganizationTeam({
    actorAccountId: resolved.session.account.accountId,
    teamId: resolved.team.teamId,
    ...(parsed.data.name === undefined ? {} : { name: parsed.data.name }),
    ...(parsed.data.slug === undefined ? {} : { slug: parsed.data.slug }),
    ...(parsed.data.description === undefined
      ? {}
      : { description: parsed.data.description }),
    ...(parsed.data.visibility === undefined
      ? {}
      : { visibility: parsed.data.visibility }),
    ...(parsed.data.parentTeamId === undefined
      ? {}
      : { parentTeamId: parsed.data.parentTeamId }),
  });
  let status = 409;
  if (result.status === "updated") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  } else if (result.status === "team-not-found") {
    status = 404;
  }
  return NextResponse.json(result, { status });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ login: string; teamSlug: string }> },
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const params = await context.params;
  const resolved = await resolveTeam(params.login, params.teamSlug);
  if (resolved.status !== "resolved") {
    return unresolvedResponse(resolved.status);
  }
  const result = await deleteOrganizationTeam({
    actorAccountId: resolved.session.account.accountId,
    teamId: resolved.team.teamId,
  });
  let status = 404;
  if (result.status === "deleted") {
    status = 200;
  } else if (result.status === "permission-denied") {
    status = 403;
  }
  return NextResponse.json(result, { status });
}
