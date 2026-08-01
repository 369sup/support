import { notFound } from "next/navigation";

import { resolveRepositoryViewForActor } from "@/app/(resources)/_repository-view";
import { listRepositoryProjects } from "@/modules/collaboration/projects/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { getRepositoryForViewing } from "@/modules/repositories/repositories/server-api";

export default async function RepositoryProjectsPage({
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
  const result = await listRepositoryProjects(repository.repositoryId);

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Linked projects
        </h1>
        <div className="mt-8 grid gap-5">
          {result.projects.map((project) => (
            <article
              className="rounded-xl border border-white/15 bg-[#0a1624] p-5"
              key={project.projectId}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold text-white">{project.title}</h2>
                <span className="text-xs uppercase text-emerald-300">
                  {project.state}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {project.description}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                {project.items.length} items · linked, not repository-owned
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
