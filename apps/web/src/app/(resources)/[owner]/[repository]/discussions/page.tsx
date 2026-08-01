import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { listRepositoryDiscussions } from "@/modules/collaboration/discussions/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function DiscussionsPage({
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
  const result = await listRepositoryDiscussions(repository.repositoryId);
  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
              {routeParams.owner}/{routeParams.repository}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Discussions
            </h1>
          </div>
          {repository.lifecycleState === "active" && session !== null ? (
            <Link
              className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
              href={`/${routeParams.owner}/${routeParams.repository}/discussions/new`}
            >
              New discussion
            </Link>
          ) : (
            <span className="text-sm text-amber-200">
              Archived repositories are read-only.
            </span>
          )}
        </div>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {result.discussions.map((discussion) => (
            <li className="px-5 py-4" key={discussion.discussionId}>
              <Link
                className="font-semibold text-white hover:text-emerald-200"
                href={`/${routeParams.owner}/${routeParams.repository}/discussions/${discussion.number}`}
              >
                {discussion.title}
              </Link>
              <p className="mt-1 text-sm text-slate-500">
                #{discussion.number} · {discussion.category} · @
                {discussion.authorUsername} · {discussion.state}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
