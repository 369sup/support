import Link from "next/link";
import { ArrowUpRight, FolderKanban } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";
import { RepositoryList } from "@/modules/repositories/repositories/browser-ui";

export default async function DashboardPage() {
  const session = await requireCurrentSession();
  const view = await getDashboardRepositoryView(session);
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
            emptyMessage="No repositories are visible in this context."
            repositories={view.repositories}
          />
        </div>
      </section>
    </main>
  );
}
