import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { listRepositorySubscribers } from "@/modules/engagement/subscriptions/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function WatchersPage({
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
  const subscriberResult = await listRepositorySubscribers(
    repository.repositoryId,
  );
  const subscribers =
    subscriberResult.status === "found" ? subscriberResult.subscribers : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Watchers
        </h1>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {subscribers.map((subscriber) => (
            <li className="flex items-center justify-between gap-4 px-5 py-4" key={subscriber.accountId}>
              <Link className="font-semibold text-white hover:text-emerald-200" href={`/${subscriber.username}`}>
                @{subscriber.username}
              </Link>
              <time className="text-xs text-slate-500" dateTime={subscriber.subscribedAt}>
                {new Date(subscriber.subscribedAt).toLocaleDateString("en")}
              </time>
            </li>
          ))}
          {subscribers.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No watchers yet.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
