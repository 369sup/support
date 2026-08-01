import { FolderKanban } from "lucide-react";
import { notFound } from "next/navigation";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { RepositoryList } from "@/modules/repositories/repositories/browser-ui";
import { listVisibleRepositoriesForOwner } from "@/modules/repositories/repositories/server-api";

export default async function OrganizationRepositoriesPage({
  params,
}: Readonly<{ params: Promise<{ organization: string }> }>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const organization = await getOrganizationByLogin(routeParams.organization);

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

  const repositories = await listVisibleRepositoriesForOwner({
    actorAccountId: session.account.accountId,
    ownerId: organization.organization.organizationId,
  });

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization pages · {organization.organization.login}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <FolderKanban className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization repositories
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Active and archived repositories visible to the current actor,
              including authorized private and internal repositories.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <RepositoryList
            emptyMessage="No repositories are visible to your current session."
            repositories={repositories}
          />
        </div>
      </section>
    </main>
  );
}
