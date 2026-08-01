import { notFound } from "next/navigation";
import { KeyRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { RepositoryTeamAccessManager } from "@/modules/repositories/repository-access/browser-ui";
import {
  listOrganizationTeams,
  listTeamMembers,
} from "@/modules/organizations/organization-teams/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import { getRepositoryByOwnerAndName } from "@/modules/repositories/repositories/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";

export default async function RepositoryTeamAccessPage({
  params,
}: Readonly<{
  params: Promise<{ login: string; repository: string }>;
}>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const organization = await getOrganizationByLogin(routeParams.login);
  if (organization.status !== "found") {
    notFound();
  }
  const repository = await getRepositoryByOwnerAndName(
    organization.organization.organizationId,
    routeParams.repository,
  );
  if (
    repository.status !== "found" ||
    repository.repository.owner.kind !== "organization"
  ) {
    notFound();
  }
  const permission = await resolveEffectiveRepositoryPermission({
    actor: session.account,
    repository: repository.repository,
  });
  const teams = await listOrganizationTeams({
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (teams.status !== "found") {
    notFound();
  }
  const canManageAll = permission.permission === "admin";
  const maintainedTeamIds = new Set<string>();
  if (!canManageAll) {
    await Promise.all(
      teams.teams.map(async (team) => {
        const members = await listTeamMembers({
          actorAccountId: session.account.accountId,
          teamId: team.teamId,
        });
        if (
          members.status === "found" &&
          members.members.some(
            (member) =>
              member.membership.accountId === session.account.accountId &&
              member.isMaintainer,
          )
        ) {
          maintainedTeamIds.add(team.teamId);
        }
      }),
    );
  }
  const directlyGrantedTeamIds = new Set(
    permission.sources.flatMap((source) =>
      source.kind === "team-grant" && !source.isInherited
        ? [source.teamId]
        : [],
    ),
  );
  const manageableTeams = canManageAll
    ? teams.teams
    : teams.teams.filter(
        (team) =>
          maintainedTeamIds.has(team.teamId) &&
          directlyGrantedTeamIds.has(team.teamId),
      );
  if (manageableTeams.length === 0) {
    notFound();
  }

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Repository settings · {organization.organization.login}/
          {repository.repository.name}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          >
            <KeyRound className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Repository team access
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Grant, change, or revoke direct team access. Inherited access must
              be changed at the granting parent team.
            </p>
          </div>
        </div>
        <div className="mt-9">
          <RepositoryTeamAccessManager
            canManageAll={canManageAll}
            organizationLogin={organization.organization.login}
            repositoryName={repository.repository.name}
            teams={manageableTeams}
          />
        </div>
      </section>
    </main>
  );
}
