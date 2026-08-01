import Link from "next/link";
import { notFound } from "next/navigation";

import { listRepositoryIssues } from "@/modules/collaboration/issues/server-api";
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

export default async function IssuesPage({
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

  const result = await listRepositoryIssues({
    repositoryId: repositoryResult.repository.repositoryId,
  });
  const issues = result.status === "found" ? result.issues : [];
  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
              {routeParams.owner}/{routeParams.repository}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
              Issues
            </h1>
          </div>
          <Link
            className="rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            href={`/${routeParams.owner}/${routeParams.repository}/issues/new`}
          >
            New issue
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {issues.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-slate-500">
              No issues yet.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {issues.map((issue) => (
                <li className="px-5 py-4" key={issue.issueId}>
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        issue.state === "open"
                          ? "mt-1.5 size-2.5 rounded-full bg-emerald-400"
                          : "mt-1.5 size-2.5 rounded-full bg-violet-400"
                      }
                    />
                    <div className="min-w-0">
                      <Link
                        className="font-semibold text-white hover:text-emerald-200"
                        href={`/${routeParams.owner}/${routeParams.repository}/issues/${issue.number}`}
                      >
                        {issue.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        #{issue.number} opened by @{issue.authorUsername} ·{" "}
                        {issue.state}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
