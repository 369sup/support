import { notFound } from "next/navigation";
import { UsersRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";

export default async function EnterpriseRolesPage({
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
              Enterprise roles
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Enterprise roles are intentionally compact in this environment. Your
              active assignment is the default signal for admin access.
            </p>
          </div>
          <p className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
            {decision.roleName}
          </p>
        </div>
        <div className="mt-9 rounded-xl border border-white/15 bg-[#0a1624] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <UsersRound
              aria-hidden="true"
              className="mt-1 size-5 text-emerald-400"
            />
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Your enterprise role
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                You are currently assigned as <span className="font-semibold text-slate-200">{decision.roleName}</span> for this
                enterprise.
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300">
            {decision.permissions.map((permission) => (
              <li key={permission} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-emerald-400" />
                <span className="leading-6">{permission}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
