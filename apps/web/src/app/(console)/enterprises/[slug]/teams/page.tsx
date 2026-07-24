import { notFound } from "next/navigation";
import { UsersRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";

export default async function EnterpriseTeamsPage({
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
        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          >
            <UsersRound className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Enterprise teams
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Enterprise team coordination is planned as a staged rollout. This page
              keeps the current route discoverable and access-consistent.
            </p>
          </div>
        </div>

        <div className="mt-9 rounded-xl border border-white/15 bg-[#0a1624] p-6 text-sm leading-7 text-slate-400">
          <p>
            Enterprise teams can be used later to grant shared permissions across
            organizations. In this build, the function is intentionally deferred to
            keep alignment with the current bounded-context delivery.
          </p>
        </div>
      </section>
    </main>
  );
}
