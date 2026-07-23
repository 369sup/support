import { NextResponse } from "next/server";
import { z } from "zod";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { resolveOrganizationRouteContext } from "@/app/_organization-administration/route-context";
import {
  createOrganizationTeam,
  listOrganizationTeams,
} from "@/modules/organizations/organization-teams/server-api";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(280).default(""),
  visibility: z.enum(["visible", "secret"]),
  parentTeamId: z.string().min(1).nullable().optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ login: string }> },
) {
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
  const result = await listOrganizationTeams({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
  });
  return NextResponse.json(result, {
    status: result.status === "found" ? 200 : 403,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ login: string }> },
) {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
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
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const result = await createOrganizationTeam({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    ...(parsed.data.parentTeamId === undefined
      ? {}
      : { parentTeamId: parsed.data.parentTeamId }),
  });
  let status = 400;
  if (result.status === "created") {
    status = 201;
  } else if (
    result.status === "permission-denied" ||
    result.status === "membership-inactive"
  ) {
    status = 403;
  } else if (result.status === "team-slug-conflict") {
    status = 409;
  }
  return NextResponse.json(result, { status });
}
