import { FolderKanban, LockKeyhole } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";

export default async function RepositoriesPage() {
  const session = await requireCurrentSession();
  const view = await getDashboardRepositoryView(session);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Selected {view.context.kind} context
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Repositories
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Active repositories visible to @{session.account.username}.
              Context selection narrows the owner scope but never grants
              access.
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {view.repositories.length}{" "}
            {view.repositories.length === 1 ? "repository" : "repositories"}
          </span>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_auto_auto] gap-5 border-b border-white/10 px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid">
            <span>Repository</span>
            <span>Visibility</span>
            <span>Permission</span>
          </div>
          {view.repositories.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-slate-500"
              role="status"
            >
              No active repositories are available.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {view.repositories.map((repository) => (
                <li
                  className="grid gap-4 px-4 py-5 sm:grid-cols-[minmax(0,1.5fr)_auto_auto] sm:items-center sm:gap-5 sm:px-5"
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
                      <h2 className="truncate font-mono font-semibold text-slate-100">
                        {repository.ownerLogin}/{repository.name}
                      </h2>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {repository.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-400 capitalize">
                    {repository.visibility}
                  </span>
                  <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 capitalize">
                    {repository.permission}
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
