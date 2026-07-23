import { notFound } from "next/navigation";

import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/app/_authentication/current-session";
import { OrganizationTeamsManager } from "@/app/organization-teams-manager";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import {
  listOrganizationTeams,
  listTeamMembers,
} from "@/modules/organizations/organization-teams/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export default async function OrganizationTeamsPage({
  params,
}: Readonly<{ params: Promise<{ login: string }> }>) {
  const session = await requireCurrentSession();
  const organization = await getOrganizationByLogin((await params).login);
  if (organization.status !== "found") {
    notFound();
  }
  const eligibility = await checkOrganizationContextEligibility({
    accountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (eligibility.status !== "eligible") {
    notFound();
  }
  const teamsResult = await listOrganizationTeams({
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
  });
  if (teamsResult.status !== "found") {
    notFound();
  }
  const teams = await Promise.all(
    teamsResult.teams.map(async (team) => {
      const membersResult = await listTeamMembers({
        actorAccountId: session.account.accountId,
        teamId: team.teamId,
      });
      const members =
        membersResult.status === "found"
          ? await Promise.all(
              membersResult.members.map(async (member) => {
                const account = await getAccountReferenceById(
                  member.membership.accountId,
                );
                return {
                  ...member,
                  username:
                    account.status === "found"
                      ? account.account.username
                      : member.membership.accountId,
                };
              }),
            )
          : [];
      return { ...team, members };
    }),
  );

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          {organization.organization.displayName}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em]">
          Organization teams
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Manage direct membership, maintainers, visibility, and the team
          hierarchy. Repository access remains an independent grant.
        </p>
        <Separator className="my-10" />
        <OrganizationTeamsManager
          canManageAll={eligibility.membership.role === "owner"}
          currentAccountId={session.account.accountId}
          organizationLogin={organization.organization.login}
          teams={teams}
        />
      </section>
    </main>
  );
}
