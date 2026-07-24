import { notFound } from "next/navigation";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";

export default async function EnterprisePeoplePage({
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

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Enterprise administration
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Enterprise people
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              People in this environment are identity-scoped to the development
              dataset. Administrative users are shown here with current session
              context.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="grid gap-2 border-b border-white/10 px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid-cols-[minmax(0,1.5fr)_auto] sm:grid">
            <span>Account</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-white/10">
            <li className="px-5 py-4 sm:grid sm:grid-cols-[minmax(0,1.5fr)_auto] sm:items-center sm:gap-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-100">
                  {session.account.username}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {session.account.accountId}
                </p>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300 sm:mt-0">
                Active affiliation
              </p>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
