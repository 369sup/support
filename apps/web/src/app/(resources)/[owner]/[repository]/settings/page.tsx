import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import Link from "next/link";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { getRepositoryByOwnerAndName } from "@/modules/repositories/repositories/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";

type OwnerLookupResult =
  | Readonly<{ kind: "organization"; login: string; id: string }>
  | Readonly<{ kind: "account"; login: string; id: string }>;

type PermissionLevel =
  | "admin"
  | "maintain"
  | "write"
  | "triage"
  | "read";

async function resolveOwnerByLogin(owner: string): Promise<OwnerLookupResult | null> {
  const organization = await getOrganizationByLogin(owner);
  if (organization.status === "found") {
    return {
      kind: "organization",
      id: organization.organization.organizationId,
      login: organization.organization.login,
    };
  }

  const account = await getPersonalAccountByUsername(owner);
  if (account.status !== "found") {
    return null;
  }

  return {
    kind: "account",
    id: account.account.accountId,
    login: account.account.username,
  };
}

export default async function RepositorySettingsPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const owner = await resolveOwnerByLogin(routeParams.owner);
  if (owner === null) {
    notFound();
  }

  const repositoryResult = await getRepositoryByOwnerAndName(
    owner.id,
    routeParams.repository,
  );
  if (repositoryResult.status !== "found") {
    notFound();
  }

  const permission = await resolveEffectiveRepositoryPermission({
    actor: session.account,
    repository: repositoryResult.repository,
  });
  if (permission.permission !== "admin" && permission.permission !== "maintain") {
    notFound();
  }

  const repository = repositoryResult.repository;

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Repository settings · {repository.owner.login}/{repository.name}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Settings aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Repository settings
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Administrative settings are intentionally constrained to a small, implemented surface.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-300">
              Settings sections
            </h2>
          </div>
          <ul className="divide-y divide-white/10 text-sm text-slate-200">
            <li className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
              <div>
                <p className="font-semibold text-slate-100">Team access</p>
                <p className="mt-1 text-slate-400">
                  Configure direct team grants and inherited membership permissions.
                </p>
              </div>
              <Link
                href={`/${owner.login}/${repository.name}/settings/access`}
                className="inline-flex w-fit rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-100 underline decoration-dashed underline-offset-4"
              >
                Open team access
              </Link>
            </li>
            <li className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
              <div>
                <p className="font-semibold text-slate-100">Webhook and integrations</p>
                <p className="mt-1 text-slate-400">
                  Planned for future phases; currently not implemented.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-500">
                Not implemented
              </span>
            </li>
            <li className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
              <div>
                <p className="font-semibold text-slate-100">Danger zone</p>
                <p className="mt-1 text-slate-400">
                  Destructive repository operations are intentionally omitted while this
                  product slice remains non-code focused.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-md border border-white/10 px-2.5 py-1 text-xs text-emerald-300">
                Enabled by design
              </span>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
