import { redirect, notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { readFormString } from "@/app/_route-contracts/read-form-string";
import { createIssue } from "@/modules/collaboration/issues/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

async function createIssueAction(formData: FormData): Promise<never> {
  "use server";

  const owner = readFormString(formData, "owner");
  const repositoryName = readFormString(formData, "repository");
  const session = await requireCurrentSession();
  const repository = await resolveRepositoryViewForActor(
    session.account.accountId,
    owner,
    repositoryName,
    getRepositoryForViewing,
  );
  if (repository === null) {
    notFound();
  }
  if (repository.lifecycleState !== "active") {
    redirect(`/${owner}/${repositoryName}/issues?repository=archived-read-only`);
  }

  const result = await createIssue({
    repositoryId: repository.repositoryId,
    actorAccountId: session.account.accountId,
    actorUsername: session.account.username,
    title: readFormString(formData, "title"),
    body: readFormString(formData, "body"),
    createdAt: new Date().toISOString(),
  });
  if (result.status !== "created") {
    redirect(`/${owner}/${repositoryName}/issues/new?status=invalid`);
  }
  redirect(`/${owner}/${repositoryName}/issues/${result.issue.number}`);
}

export default async function NewIssuePage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
  searchParams: Promise<{ status?: string }>;
}>) {
  const [routeParams, query] = await Promise.all([params, searchParams]);
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
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${routeParams.owner}/${routeParams.repository}/issues?repository=archived-read-only`,
    );
  }

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          New issue
        </h1>
        {query.status === "invalid" ? (
          <p
            className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
            role="alert"
          >
            Add both a title and description.
          </p>
        ) : null}
        <form action={createIssueAction} className="mt-7 grid gap-5">
          <input name="owner" type="hidden" value={routeParams.owner} />
          <input
            name="repository"
            type="hidden"
            value={routeParams.repository}
          />
          <label className="grid gap-2 text-sm font-medium">
            Title
            <input
              className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 outline-none focus:border-emerald-400"
              name="title"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Description
            <textarea
              className="min-h-48 resize-y rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 outline-none focus:border-emerald-400"
              name="body"
              required
            />
          </label>
          <button
            className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            type="submit"
          >
            Create issue
          </button>
        </form>
      </section>
    </main>
  );
}
