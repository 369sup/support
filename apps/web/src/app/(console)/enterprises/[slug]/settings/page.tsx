import Link from "next/link";
import { CreditCard, ScrollText, Settings } from "lucide-react";

import { notFound } from "next/navigation";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";

export default async function EnterpriseSettingsPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const session = await requireCurrentSession();
  const enterprise = await getEnterpriseBySlug((await params).slug);
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

  const section = {
    slug: enterprise.enterprise.slug,
    name: enterprise.enterprise.displayName,
  };

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Enterprise administration
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Enterprise settings
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Configure settings and operational pages for {section.name}.
            </p>
          </div>
          <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
            {decision.roleName}
          </p>
        </div>

        <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${section.slug}/settings/apps`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">Apps</span>
              <Settings aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage enterprise app connections and installations.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
            </span>
          </Link>
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${section.slug}/settings/billing`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">Billing</span>
              <CreditCard aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Update billing visibility and enterprise-level license settings.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
            </span>
          </Link>
          <Link
            className="group rounded-xl border border-white/15 bg-[#0a1624] p-4 transition hover:border-emerald-400/50 hover:bg-emerald-400/10"
            href={`/enterprises/${section.slug}/settings/audit-log`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-100">Audit log</span>
              <ScrollText aria-hidden="true" className="size-4 text-slate-500" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Inspect event visibility and administrative activity.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 transition group-hover:text-emerald-300">
              Open
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}

