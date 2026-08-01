import { FolderKanban, FolderLock, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";
import { resolveOwnerIdByLogin } from "../../_repository-view";

type PermissionLevel =
  | "admin"
  | "maintain"
  | "write"
  | "triage"
  | "read";

function isManageable(permission: PermissionLevel | null): boolean {
  return permission === "admin" || permission === "maintain";
}

async function resolveRepositoryForActor(ownerLogin: string, repositoryName: string) {
  const session = await getOptionalCurrentSession();
  const ownerId = await resolveOwnerIdByLogin(ownerLogin);
  if (ownerId === null) {
    return null;
  }
  const result = await getRepositoryForViewing({
    actorAccountId: session?.account.accountId ?? null,
    ownerId,
    name: repositoryName,
  });
  return result.status === "found"
    ? result.repository
    : null;
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

  const repository = access;
  const canManage = isManageable(repository.permission);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section
            aria-labelledby="repository-overview-heading"
            className="rounded-xl border border-border bg-card p-6"
          >
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              Repository overview
            </p>
            <h1
              className="mt-2 text-3xl font-semibold tracking-[-0.04em]"
              id="repository-overview-heading"
            >
              Collaboration workspace
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              Issues collect actionable work, Discussions retain community
              conversations, and Projects connect planning views without
              introducing Git or code workflows.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                ["Issues", "Track tasks, feedback, and decisions."],
                ["Discussions", "Ask questions and hold durable conversations."],
                ["Projects", "Review linked planning views and work items."],
                ["Activity", "Follow supported non-code collaboration events."],
              ].map(([title, description]) => (
                <article
                  className="rounded-lg border border-border bg-background/50 p-4"
                  key={title}
                >
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <aside
            aria-labelledby="repository-about-heading"
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2">
              <FolderKanban aria-hidden="true" className="size-4 text-primary" />
              <h2 className="font-semibold" id="repository-about-heading">
                About
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {repository.description === ""
                ? "No description has been provided."
                : repository.description}
            </p>
            {repository.homepage === "" ? null : (
              <a
                className="mt-4 block break-all text-sm text-primary underline underline-offset-4"
                href={repository.homepage}
                rel="noreferrer"
                target="_blank"
              >
                {repository.homepage}
              </a>
            )}
            <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Visibility</dt>
                <dd className="capitalize">{repository.visibility}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Your role</dt>
                <dd className="capitalize">{repository.permission}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">State</dt>
                <dd className="capitalize">{repository.lifecycleState}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {canManage
              ? "Maintain or administration capabilities available"
              : "Repository view access granted"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground">
            <FolderLock className="size-3.5" aria-hidden="true" />
            Git content and code workflows remain out of scope.
          </span>
        </div>
      </section>
    </main>
  );
}
