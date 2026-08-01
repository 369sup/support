import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { listRepositoryIssues } from "@/modules/collaboration/issues/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function IssuesPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const session = await getOptionalCurrentSession();
  const repository = await resolveRepositoryViewForActor(
    session?.account.accountId ?? null,
    routeParams.owner,
    routeParams.repository,
    getRepositoryForViewing,
  );
  if (repository === null) {
    notFound();
  }

  const result = await listRepositoryIssues({
    repositoryId: repository.repositoryId,
  });
  const issues = result.status === "found" ? result.issues : [];
  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
              {routeParams.owner}/{routeParams.repository}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Issues
            </h1>
          </div>
          {repository.lifecycleState === "active" && session !== null ? (
            <Link
              className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              href={`/${routeParams.owner}/${routeParams.repository}/issues/new`}
            >
              New issue
            </Link>
          ) : (
            <span className="text-sm text-amber-200">
              Archived repositories are read-only.
            </span>
          )}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {issues.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              No issues yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {issues.map((issue) => (
                <li className="px-5 py-4" key={issue.issueId}>
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        issue.state === "open"
                          ? "mt-1.5 size-2.5 rounded-full bg-emerald-400"
                          : "mt-1.5 size-2.5 rounded-full bg-violet-400"
                      }
                    />
                    <div className="min-w-0">
                      <Link
                        className="font-semibold text-white hover:text-emerald-200"
                        href={`/${routeParams.owner}/${routeParams.repository}/issues/${issue.number}`}
                      >
                        {issue.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        #{issue.number} opened by @{issue.authorUsername} ·{" "}
                        {issue.state}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
