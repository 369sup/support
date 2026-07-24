import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

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
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization settings · {organization.organization.login}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          >
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization roles
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Assign predefined roles to active organization members or teams.
              Custom roles remain planned.
            </p>
          </div>
        </div>
        <div className="mt-9">
          <OrganizationRolesManager
            assignments={
              assignments.status === "found" ? assignments.assignments : []
            }
            canManage={canManage}
            organizationLogin={organization.organization.login}
            roles={roles.roles}
          />
        </div>
      </section>
    </main>
  );
}
