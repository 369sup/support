import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { listRepositoryStargazers } from "@/modules/engagement/stars/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function StargazersPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const session = await requireCurrentSession();
  const repository = await resolveRepositoryViewForActor(
    session.account.accountId,
    routeParams.owner,
    routeParams.repository,
    getRepositoryForViewing,
  );
  if (repository === null) {
    notFound();
  }
  const stargazerResult = await listRepositoryStargazers(
    repository.repositoryId,
  );
  const stargazers =
    stargazerResult.status === "found" ? stargazerResult.stargazers : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Stargazers
        </h1>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {stargazers.map((stargazer) => (
            <li className="flex items-center justify-between gap-4 px-5 py-4" key={stargazer.accountId}>
              <Link className="font-semibold text-white hover:text-emerald-200" href={`/${stargazer.username}`}>
                @{stargazer.username}
              </Link>
              <time className="text-xs text-slate-500" dateTime={stargazer.starredAt}>
                {new Date(stargazer.starredAt).toLocaleDateString("en")}
              </time>
            </li>
          ))}
          {stargazers.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No stars yet.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
