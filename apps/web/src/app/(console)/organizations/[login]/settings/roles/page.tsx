import { notFound } from "next/navigation";

import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { OrganizationRolesManager } from "@/modules/organizations/organization-roles/browser-ui";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import {
  listOrganizationRoleAssignments,
  listPredefinedOrganizationRoles,
} from "@/modules/organizations/organization-roles/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export default async function OrganizationRolesPage({
  params,
}: Readonly<{ params: Promise<{ login: string }> }>) {
  const session = await requireCurrentSession();
  const organization = await getOrganizationByLogin((await params).login);
  if (organization.status !== "found") {
    notFound();
  }
  const eligibility = await checkOrganizationContextEligibility({
    accountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (eligibility.status !== "eligible") {
    notFound();
  }
  const roles = await listPredefinedOrganizationRoles({
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (roles.status !== "found") {
    notFound();
  }
  const canManage = eligibility.membership.role === "owner";
  const assignments = canManage
    ? await listOrganizationRoleAssignments({
        actorAccountId: session.account.accountId,
        organizationId: organization.organization.organizationId,
      })
    : { status: "permission-denied" as const };

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          {organization.organization.displayName}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em]">
          Organization roles
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Assign predefined roles to active organization members or teams.
          Custom roles remain planned.
        </p>
        <Separator className="my-10" />
        <OrganizationRolesManager
          assignments={
            assignments.status === "found" ? assignments.assignments : []
          }
          canManage={canManage}
          organizationLogin={organization.organization.login}
          roles={roles.roles}
        />
      </section>
    </main>
  );
}
