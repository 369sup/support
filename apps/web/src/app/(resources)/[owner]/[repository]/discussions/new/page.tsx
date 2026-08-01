import { notFound, redirect } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { readFormString } from "@/app/_route-contracts/read-form-string";
import {
  createDiscussion,
  type DiscussionCategory,
} from "@/modules/collaboration/discussions/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

async function resolveAccess(owner: string, repositoryName: string) {
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
  return { repository, session };
}

async function createDiscussionAction(formData: FormData): Promise<never> {
  "use server";

  const owner = readFormString(formData, "owner");
  const repositoryName = readFormString(formData, "repository");
  const { repository, session } = await resolveAccess(owner, repositoryName);
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${owner}/${repositoryName}/discussions?repository=archived-read-only`,
    );
  }
  const requestedCategory = readFormString(formData, "category");
  let category: DiscussionCategory = "general";
  if (
    requestedCategory === "q-and-a" ||
    requestedCategory === "announcements"
  ) {
    category = requestedCategory;
  }
  const result = await createDiscussion({
    actorAccountId: session.account.accountId,
    actorUsername: session.account.username,
    body: readFormString(formData, "body"),
    category,
    createdAt: new Date().toISOString(),
    repositoryId: repository.repositoryId,
    title: readFormString(formData, "title"),
  });
  if (result.status === "created") {
    redirect(
      `/${owner}/${repositoryName}/discussions/${result.discussion.number}`,
    );
  }
  redirect(
    `/${owner}/${repositoryName}/discussions/new?status=${result.status}`,
  );
}

export default async function NewDiscussionPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const { repository } = await resolveAccess(
    routeParams.owner,
    routeParams.repository,
  );
  if (repository.lifecycleState !== "active") {
    redirect(
      `/${routeParams.owner}/${routeParams.repository}/discussions?repository=archived-read-only`,
    );
  }

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-3xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          New discussion
        </h1>
        <form action={createDiscussionAction} className="mt-8 grid gap-5">
          <input name="owner" type="hidden" value={routeParams.owner} />
          <input
            name="repository"
            type="hidden"
            value={routeParams.repository}
          />
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Category
            <select
              className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5"
              defaultValue="general"
              name="category"
            >
              <option value="general">General</option>
              <option value="q-and-a">Q&amp;A</option>
              <option value="announcements">Announcements</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Title
            <input
              className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5"
              name="title"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Body
            <textarea
              className="min-h-48 rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5"
              name="body"
              required
            />
          </label>
          <button
            className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950"
            type="submit"
          >
            Start discussion
          </button>
        </form>
      </section>
    </main>
  );
}
