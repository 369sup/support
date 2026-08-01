import Link from "next/link";
import { Building2, Link2, ShieldCheck, UsersRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  getEnterpriseBySlug,
  listEnterpriseOrganizations,
} from "@/modules/enterprises/enterprises/server-api";

export default async function EnterprisePage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const session = await requireCurrentSession();
  const enterprise = await getEnterpriseBySlug((await params).slug);
  if (enterprise.status !== "found") {
    return notFoundEnterprisePage();
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
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Enterprise administration
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              {enterprise.enterprise.displayName}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Enterprise identity owns linked organizations and supports admin-only
              workflows in organization settings.
            </p>
          </div>
          <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
            {decision.roleName}
          </p>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${enterprise.enterprise.slug}/organizations`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">
                Linked organizations
              </span>
              <Building2 aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Open the organization inventory owned by this enterprise.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
              <Link2 aria-hidden="true" className="size-3.5" />
            </span>
          </Link>
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${enterprise.enterprise.slug}/enterprise_roles`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">Enterprise roles</span>
              <ShieldCheck aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review your effective admin capabilities for this enterprise.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
              <Link2 aria-hidden="true" className="size-3.5" />
            </span>
          </Link>
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${enterprise.enterprise.slug}/people`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">Enterprise people</span>
              <UsersRound aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Inspect enterprise membership visibility for your account context.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
              <Link2 aria-hidden="true" className="size-3.5" />
            </span>
          </Link>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="grid gap-2 border-b border-white/10 px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid-cols-[minmax(0,1.5fr)_auto] sm:grid">
            <span>Organization</span>
            <span>Visibility</span>
          </div>
          {organizations.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500" role="status">
              No connected organizations are configured for this enterprise.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {organizations.map((organization) => (
                <li
                  className="px-5 py-4 sm:grid sm:grid-cols-[minmax(0,1.5fr)_auto] sm:items-center sm:gap-4"
                  key={organization.organizationId}
                >
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-100">
                      {organization.displayName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">@{organization.login}</p>
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 sm:mt-0">
                    linked
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function notFoundEnterprisePage() {
  return (
    <main className="flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-3xl rounded-xl border border-white/15 bg-[#0a1624] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Enterprise
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Enterprise not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          This enterprise slug does not exist in the development dataset.
        </p>
      </section>
    </main>
  );
}
