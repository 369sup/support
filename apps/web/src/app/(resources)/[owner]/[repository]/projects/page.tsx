import { notFound } from "next/navigation";

import { listRepositoryProjects } from "@/modules/collaboration/projects/server-api";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";
import { getRepositoryByOwnerAndName } from "@/modules/repositories/repositories/server-api";

async function resolveOwnerId(login: string): Promise<string | null> {
  const organization = await getOrganizationByLogin(login);
  if (organization.status === "found") {
    return organization.organization.organizationId;
  }
  const account = await getPersonalAccountByUsername(login);
  return account.isSuccessful ? account.account.accountId : null;
}

export default async function RepositoryProjectsPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string; repository: string }>;
}>) {
  const routeParams = await params;
  const [session, ownerId] = await Promise.all([
    requireCurrentSession(),
    resolveOwnerId(routeParams.owner),
  ]);
  if (ownerId === null) {
    notFound();
  }
  const repositoryResult = await getRepositoryByOwnerAndName(
    ownerId,
    routeParams.repository,
  );
  if (repositoryResult.status !== "found") {
    notFound();
  }
  const permission = await resolveEffectiveRepositoryPermission({
    actor: session.account,
    repository: repositoryResult.repository,
  });
  if (!permission.isAllowed) {
    notFound();
  }
  const result = await listRepositoryProjects(
    repositoryResult.repository.repositoryId,
  );

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
