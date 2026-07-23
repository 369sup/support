import { NextResponse } from "next/server";
import { z } from "zod";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import {
  assignOrganizationRole,
  listOrganizationRoleAssignments,
} from "@/modules/organizations/organization-roles/server-api";
import { getOrganizationTeam } from "@/modules/organizations/organization-teams/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

const roleKeySchema = z.enum([
  "moderator",
  "security-manager",
  "ci-cd-admin",
  "app-manager",
  "all-repository-read",
  "all-repository-triage",
  "all-repository-write",
  "all-repository-maintain",
  "all-repository-admin",
]);

const assignmentSchema = z.discriminatedUnion("subjectKind", [
  z.object({
    roleKey: roleKeySchema,
    subjectKind: z.literal("account"),
    subjectIdentifier: z.string().trim().min(1).max(100),
  }),
  z.object({
    roleKey: roleKeySchema,
    subjectKind: z.literal("team"),
    subjectIdentifier: z.string().trim().min(1).max(100),
  }),
]);

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
  const result = await listOrganizationRoleAssignments({
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
): Promise<Response> {
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
  const parsed = assignmentSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const subject =
    parsed.data.subjectKind === "account"
      ? await resolveAccountSubject(parsed.data.subjectIdentifier)
      : await resolveTeamSubject({
          actorAccountId: resolved.session.account.accountId,
          organizationId: resolved.organization.organizationId,
          teamSlug: parsed.data.subjectIdentifier,
        });
  if (subject === null) {
    return NextResponse.json(
      { status: "subject-not-eligible" },
      { status: 404 },
    );
  }
  const result = await assignOrganizationRole({
    actorAccountId: resolved.session.account.accountId,
    organizationId: resolved.organization.organizationId,
    roleKey: parsed.data.roleKey,
    subject,
  });
  let status = 400;
  if (result.status === "assigned") {
    status = 201;
  } else if (result.status === "permission-denied") {
    status = 403;
  } else if (result.status === "assignment-conflict") {
    status = 409;
  }
  return NextResponse.json(result, { status });
}

async function resolveAccountSubject(accountId: string) {
  const account = await getAccountReferenceById(accountId);
  return account.status === "found"
    ? ({ kind: "account", accountId: account.account.accountId } as const)
    : null;
}

async function resolveTeamSubject(input: {
  actorAccountId: string;
  organizationId: string;
  teamSlug: string;
}) {
  const team = await getOrganizationTeam(input);
  return team.status === "found"
    ? ({ kind: "team", teamId: team.team.teamId } as const)
    : null;
}
