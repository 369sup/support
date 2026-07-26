import Link from "next/link";
import { notFound } from "next/navigation";

import { listRepositoryStargazers } from "@/modules/engagement/stars/server-api";
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

export default async function StargazersPage({
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
  const result = await getRepositoryByOwnerAndName(
    ownerId,
    routeParams.repository,
  );
  if (result.status !== "found") {
    notFound();
  }
  const permission = await resolveEffectiveRepositoryPermission({
    actor: session.account,
    repository: result.repository,
  });
  if (!permission.isAllowed) {
    notFound();
  }
  const stargazerResult = await listRepositoryStargazers(
    result.repository.repositoryId,
  );
  const stargazers =
    stargazerResult.status === "found" ? stargazerResult.stargazers : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          {routeParams.owner}/{routeParams.repository}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Stargazers
        </h1>
        <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          {stargazers.map((stargazer) => (
            <li className="flex items-center justify-between gap-4 px-5 py-4" key={stargazer.accountId}>
              <Link className="font-semibold text-white hover:text-emerald-200" href={`/${stargazer.username}`}>
                @{stargazer.username}
              </Link>
              <time className="text-xs text-slate-500" dateTime={stargazer.starredAt}>
                {new Date(stargazer.starredAt).toLocaleDateString("en")}
              </time>
            </li>
          ))}
          {stargazers.length === 0 ? (
            <li className="px-5 py-12 text-center text-sm text-slate-500">
              No stars yet.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
