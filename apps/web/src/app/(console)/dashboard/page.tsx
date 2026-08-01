import Link from "next/link";
import { ArrowUpRight, FolderKanban, LockKeyhole } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";

export default async function DashboardPage() {
  const session = await requireCurrentSession();
  const view = await getDashboardRepositoryView(session);
  const organizationLogin =
    view.context.kind === "organization" ? view.context.login : null;

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {view.context.kind === "personal"
            ? `Personal context · @${view.context.login}`
            : `Organization context · ${view.context.displayName}`}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Dashboard
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Repositories are scoped by the selected context and filtered by
              source-attributed permissions.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {view.repositories.length} visible{" "}
            {view.repositories.length === 1 ? "repository" : "repositories"}
          </span>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <FolderKanban
              aria-hidden="true"
              className="size-4 text-emerald-400"
            />
            <h2 className="font-semibold text-white">Repositories</h2>
            <Link
              className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300"
              href="/repositories"
            >
              View all
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <RepositoryList
            organizationLogin={organizationLogin}
            repositories={view.repositories}
          />
        </div>
      </section>
    </main>
  );
}

function RepositoryList({
  organizationLogin,
  repositories,
}: Readonly<{
  organizationLogin: string | null;
  repositories: Awaited<
    ReturnType<typeof getDashboardRepositoryView>
  >["repositories"];
}>) {
  if (repositories.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-slate-500" role="status">
        No repositories are visible in this context.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/10">
      {repositories.map((repository) => (
        <li
          className="grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_auto_auto_minmax(8rem,0.45fr)] lg:items-center"
          key={repository.repositoryId}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {repository.visibility === "public" ? (
                <FolderKanban
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-500"
                />
              ) : (
                <LockKeyhole
                  aria-hidden="true"
                  className="size-4 shrink-0 text-slate-500"
                />
              )}
              <h3 className="truncate font-mono font-semibold text-slate-100">
                {repository.ownerLogin}/{repository.name}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {repository.description}
            </p>
          </div>
          <span className="w-fit rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-400 capitalize">
            {repository.visibility}
          </span>
          <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 capitalize">
            {repository.permission}
          </span>
          <div className="lg:text-right">
            {organizationLogin !== null &&
            repository.permission === "admin" ? (
              <Link
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                href={`/organizations/${organizationLogin}/settings/repository-access/${repository.name}`}
              >
                Manage team access
              </Link>
            ) : (
              <span className="text-sm text-slate-600">View only</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
