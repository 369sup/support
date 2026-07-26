import {
  Bell,
  BookOpen,
  FolderKanban,
  FolderLock,
  Settings,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  listRepositoryStargazers,
  toggleRepositoryStar,
} from "@/modules/engagement/stars/server-api";
import {
  listRepositorySubscribers,
  toggleRepositorySubscription,
} from "@/modules/engagement/subscriptions/server-api";
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

function isManageable(permission: PermissionLevel | null): boolean {
  return permission === "admin" || permission === "maintain";
}

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
  if (!account.isSuccessful) {
    return null;
  }

  return {
    kind: "account",
    id: account.account.accountId,
    login: account.account.username,
  };
}

async function resolveRepositoryForActor(ownerLogin: string, repositoryName: string) {
  const session = await requireCurrentSession();
  const owner = await resolveOwnerByLogin(ownerLogin);
  if (owner === null) {
    return null;
  }
  const result = await getRepositoryByOwnerAndName(owner.id, repositoryName);
  if (result.status !== "found") {
    return null;
  }
  const permission = await resolveEffectiveRepositoryPermission({
    actor: session.account,
    repository: result.repository,
  });
  return permission.isAllowed
    ? { permission, repository: result.repository, session }
    : null;
}

async function toggleStarAction(formData: FormData): Promise<never> {
  "use server";

  const owner = readFormString(formData, "owner").trim();
  const repositoryName = readFormString(formData, "repository").trim();
  const access = await resolveRepositoryForActor(owner, repositoryName);
  if (access === null) {
    notFound();
  }
  await toggleRepositoryStar({
    actorAccountId: access.session.account.accountId,
    actorUsername: access.session.account.username,
    changedAt: new Date().toISOString(),
    repositoryId: access.repository.repositoryId,
  });
  revalidatePath(`/${owner}/${repositoryName}`);
  redirect(`/${owner}/${repositoryName}`);
}

async function toggleWatchAction(formData: FormData): Promise<never> {
  "use server";

  const owner = readFormString(formData, "owner").trim();
  const repositoryName = readFormString(formData, "repository").trim();
  const access = await resolveRepositoryForActor(owner, repositoryName);
  if (access === null) {
    notFound();
  }
  await toggleRepositorySubscription({
    actorAccountId: access.session.account.accountId,
    actorUsername: access.session.account.username,
    changedAt: new Date().toISOString(),
    repositoryId: access.repository.repositoryId,
  });
  revalidatePath(`/${owner}/${repositoryName}`);
  redirect(`/${owner}/${repositoryName}`);
}

export default async function RepositoryPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const access = await resolveRepositoryForActor(
    routeParams.owner,
    routeParams.repository,
  );
  if (access === null) {
    notFound();
  }

  const { permission, repository, session } = access;
  const [stargazerResult, subscriberResult] = await Promise.all([
    listRepositoryStargazers(repository.repositoryId),
    listRepositorySubscribers(repository.repositoryId),
  ]);
  const stargazers =
    stargazerResult.status === "found" ? stargazerResult.stargazers : [];
  const subscribers =
    subscriberResult.status === "found" ? subscriberResult.subscribers : [];
  const isStarred = stargazers.some(
    (stargazer) => stargazer.accountId === session.account.accountId,
  );
  const isWatching = subscribers.some(
    (subscriber) => subscriber.accountId === session.account.accountId,
  );
  const canManage = isManageable(permission.permission);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Repository · {repository.owner.login}/{repository.name}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <FolderKanban aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              {repository.owner.login}/{repository.name}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              {repository.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-slate-600 px-2.5 py-1 text-xs capitalize text-slate-200">
            {repository.visibility}
          </span>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium uppercase text-emerald-300">
            {permission.permission ?? "read"}
          </span>
          <span className="rounded-full border border-slate-600 px-2.5 py-1 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Owner:</span> {repository.owner.kind === "organization" ? "organization" : "account"}
          </span>
          <form action={toggleStarAction}>
            <input name="owner" type="hidden" value={routeParams.owner} />
            <input
              name="repository"
              type="hidden"
              value={routeParams.repository}
            />
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-300/10"
              type="submit"
            >
              <Star aria-hidden="true" className="size-3.5" />
              {isStarred ? "Unstar" : "Star"} · {stargazers.length}
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
              className="inline-flex items-center gap-2 rounded-lg border border-sky-300/30 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-300/10"
              type="submit"
            >
              <Bell aria-hidden="true" className="size-3.5" />
              {isWatching ? "Unwatch" : "Watch"} · {subscribers.length}
            </button>
          </form>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-medium text-slate-200">Repository overview</h2>
          </div>
          <div className="grid gap-6 px-5 py-6 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-slate-100">Overview</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Repository activity surfaces are implemented in scoped modules over time.
                Browse code-free sections and repository administration from this page.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <h3 className="text-sm font-semibold text-slate-100">Navigation</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <Link
                  className="inline-flex items-center gap-2 text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}`}
                >
                  <BookOpen className="size-4" aria-hidden="true" />
                  {repository.owner.login} profile
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/issues`}
                >
                  Issues
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/discussions`}
                >
                  Discussions
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/projects`}
                >
                  Projects
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/activity`}
                >
                  Activity
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/stargazers`}
                >
                  Stargazers
                </Link>
                <Link
                  className="text-slate-200 underline decoration-dashed underline-offset-4"
                  href={`/${repository.owner.login}/${repository.name}/watchers`}
                >
                  Watchers
                </Link>
                {canManage ? (
                  <Link
                    className="inline-flex items-center gap-2 text-slate-200 underline decoration-dashed underline-offset-4"
                    href={`/${repository.owner.login}/${repository.name}/settings`}
                  >
                    <Settings className="size-4" aria-hidden="true" />
                    Repository settings
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-400">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {canManage ? "Maintain/manage capabilities available" : "Viewer access granted"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-400">
            <FolderLock className="size-3.5" aria-hidden="true" />
            Private metadata and binary content remain out of scope.
          </span>
        </div>
      </section>
    </main>
  );
}
