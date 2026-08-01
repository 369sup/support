import { Bell, Star } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  listRepositoryStargazers,
  toggleRepositoryStar,
} from "@/modules/engagement/stars/server-api";
import {
  listRepositorySubscribers,
  toggleRepositorySubscription,
} from "@/modules/engagement/subscriptions/server-api";
import {
  getOptionalCurrentSession,
  requireCurrentSession,
} from "@/modules/identity/authentication/server-api";
import { RepositoryShell } from "@/modules/repositories/repositories/browser-ui";
import { resolveRepositoryViewForActor } from "../../_repository-view";

async function resolveRepositoryActionTarget(formData: FormData) {
  const session = await requireCurrentSession();
  const owner = readFormString(formData, "owner");
  const name = readFormString(formData, "repository");
  const repository = await resolveRepositoryViewForActor(
    session.account.accountId,
    owner,
    name,
  );
  if (repository === null) {
    notFound();
  }
  return { name, owner, repository, session };
}

async function toggleStarAction(formData: FormData): Promise<never> {
  "use server";
  const target = await resolveRepositoryActionTarget(formData);
  await toggleRepositoryStar({
    actorAccountId: target.session.account.accountId,
    actorUsername: target.session.account.username,
    changedAt: new Date().toISOString(),
    repositoryId: target.repository.repositoryId,
  });
  revalidatePath(`/${target.owner}/${target.name}`);
  redirect(`/${target.owner}/${target.name}`);
}

async function toggleWatchAction(formData: FormData): Promise<never> {
  "use server";
  const target = await resolveRepositoryActionTarget(formData);
  if (target.repository.lifecycleState !== "active") {
    redirect(
      `/${target.owner}/${target.name}?repository=archived-read-only`,
    );
  }
  await toggleRepositorySubscription({
    actorAccountId: target.session.account.accountId,
    actorUsername: target.session.account.username,
    changedAt: new Date().toISOString(),
    repositoryId: target.repository.repositoryId,
  });
  revalidatePath(`/${target.owner}/${target.name}`);
  redirect(`/${target.owner}/${target.name}`);
}

export default async function RepositoryResourceLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const [session, routeParams] = await Promise.all([
    getOptionalCurrentSession(),
    params,
  ]);
  const repository = await resolveRepositoryViewForActor(
    session?.account.accountId ?? null,
    routeParams.owner,
    routeParams.repository,
  );
  if (repository === null) {
    notFound();
  }
  const [stargazerResult, subscriberResult] = await Promise.all([
    listRepositoryStargazers(repository.repositoryId),
    listRepositorySubscribers(repository.repositoryId),
  ]);
  const stargazers =
    stargazerResult.status === "found" ? stargazerResult.stargazers : [];
  const subscribers =
    subscriberResult.status === "found" ? subscriberResult.subscribers : [];
  const isStarred = stargazers.some(
    (stargazer) =>
      stargazer.accountId === session?.account.accountId,
  );
  const isWatching = subscribers.some(
    (subscriber) =>
      subscriber.accountId === session?.account.accountId,
  );
  return (
    <>
      <RepositoryShell
        actions={
          session === null ? (
            <Link
              className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              href={`/login?returnTo=${encodeURIComponent(`/${routeParams.owner}/${routeParams.repository}`)}`}
            >
              Sign in to star or watch
            </Link>
          ) : (
          <>
            <form action={toggleStarAction}>
              <input name="owner" type="hidden" value={routeParams.owner} />
              <input
                name="repository"
                type="hidden"
                value={routeParams.repository}
              />
              <button
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                type="submit"
              >
                <Star aria-hidden="true" className="size-3.5" />
                {isStarred ? "Unstar" : "Star"} {stargazers.length}
              </button>
            </form>
            <form action={toggleWatchAction}>
              <input name="owner" type="hidden" value={routeParams.owner} />
              <input
                name="repository"
                type="hidden"
                value={routeParams.repository}
              />
              <button
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                disabled={repository.lifecycleState === "archived"}
                title={
                  repository.lifecycleState === "archived"
                    ? "Archived repositories are read-only"
                    : undefined
                }
                type="submit"
              >
                <Bell aria-hidden="true" className="size-3.5" />
                {isWatching ? "Unwatch" : "Watch"} {subscribers.length}
              </button>
            </form>
          </>
          )
        }
        repository={repository}
      />
      {children}
    </>
  );
}
