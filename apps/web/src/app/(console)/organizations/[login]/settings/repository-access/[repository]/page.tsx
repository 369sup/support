import { notFound } from "next/navigation";

import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/app/_authentication/current-session";
import { RepositoryTeamAccessManager } from "@/app/repository-team-access-manager";
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
      source.kind === "team-grant" && !source.inherited
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
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          {organization.organization.login}/{repository.repository.name}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em]">
          Repository team access
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Grant, change, or revoke direct team access. Inherited access must be
          changed at the granting parent team.
        </p>
        <Separator className="my-10" />
        <RepositoryTeamAccessManager
          canManageAll={canManageAll}
          organizationLogin={organization.organization.login}
          repositoryName={repository.repository.name}
          teams={manageableTeams}
        />
      </section>
    </main>
  );
}
