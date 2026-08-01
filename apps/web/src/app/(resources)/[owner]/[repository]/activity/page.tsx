import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { listRepositoryActivity } from "@/modules/projections/activity-feed/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function RepositoryActivityPage({
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
  const activityResult = await listRepositoryActivity(repository.repositoryId);
  const items = activityResult.status === "found" ? activityResult.items : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Activity
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Supported non-code collaboration events only.
        </p>
        <ol className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {items.map((item) => (
            <li className="px-5 py-4" key={item.activityId}>
              <a className="font-semibold text-white hover:text-emerald-200" href={item.href}>
                {item.summary}
              </a>
              <p className="mt-1 text-sm text-slate-500">
                @{item.actorUsername} · {item.kind} ·{" "}
                <time dateTime={item.occurredAt}>
                  {new Date(item.occurredAt).toLocaleString("en")}
                </time>
              </p>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No supported activity yet.
            </li>
          ) : null}
        </ol>
      </section>
    </main>
  );
}
