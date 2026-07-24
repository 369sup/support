import { notFound } from "next/navigation";

import Link from "next/link";
import { Building2 } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  getEnterpriseBySlug,
  listEnterpriseOrganizations,
} from "@/modules/enterprises/enterprises/server-api";

export default async function EnterpriseOrganizationsPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const enterprise = await getEnterpriseBySlug(routeParams.slug);

  if (enterprise.status !== "found") {
    notFound();
  }

  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (decision.status !== "allowed") {
    return (
      <main className="flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-10">
        <section className="mx-auto w-full max-w-3xl rounded-xl border border-white/15 bg-[#0a1624] p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Enterprise administration
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
            Access denied
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Enterprise affiliation alone does not grant administration access.
          </p>
        </section>
      </main>
    );
  }

  const result = await listEnterpriseOrganizations(enterprise.enterprise.slug);
  const organizations =
    result.status === "found" ? result.organizations : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Enterprise administration
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
          Enterprise organizations
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-400">
          Managed organizations for {enterprise.enterprise.displayName} in this
          environment.
        </p>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
            <Building2 aria-hidden="true" className="size-4 text-emerald-400" />
            <h2 className="font-semibold text-slate-100">Organizations</h2>
          </div>
          {organizations.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500" role="status">
              No organizations are currently linked to this enterprise.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {organizations.map((organization) => (
                <li
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_auto] sm:items-center sm:gap-4"
                  key={organization.organizationId}
                >
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-100">
                      {organization.displayName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      @{organization.login}
                    </p>
                  </div>
                  <Link
                    className="w-fit text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    href={`/organizations/${organization.login}/settings/teams`}
                  >
                    Manage teams
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
