import { FolderKanban, Link as LinkIcon, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { listActivePublicRepositoriesForOrganizationOwner } from "@/modules/repositories/repositories/server-api";

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

  const repositories = await listActivePublicRepositoriesForOrganizationOwner({
    ownerOrganizationId: organization.organization.organizationId,
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
              Public repositories visible to the current actor in this
              organization context.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_auto_auto] gap-5 border-b border-white/10 px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid">
            <span>Repository</span>
            <span>Visibility</span>
            <span>State</span>
          </div>

          {repositories.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-slate-500"
              role="status"
            >
              No public repositories are available.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {repositories.map((repository) => (
                <li
                  className="grid gap-4 px-4 py-5 sm:grid-cols-[minmax(0,1.5fr)_auto_auto] sm:items-center sm:gap-5 sm:px-5"
                  key={repository.repositoryId}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {repository.visibility === "public" ? (
                        <LinkIcon
                          aria-hidden="true"
                          className="size-4 shrink-0 text-slate-500"
                        />
                      ) : (
                        <LockKeyhole
                          aria-hidden="true"
                          className="size-4 shrink-0 text-slate-500"
                        />
                      )}
                      <Link
                        className="truncate font-mono text-sm font-semibold text-slate-100 underline decoration-dashed underline-offset-4 hover:text-white"
                        href={`/${organization.organization.login}/${repository.name}`}
                      >
                        {repository.owner.username}/{repository.name}
                      </Link>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {repository.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-slate-600 px-2.5 py-1 text-xs capitalize text-slate-400">
                    {repository.visibility}
                  </span>
                  <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300 uppercase">
                    {repository.lifecycleState}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
