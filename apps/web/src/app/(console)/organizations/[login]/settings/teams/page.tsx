import { notFound } from "next/navigation";
import { UsersRound } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { OrganizationTeamsManager } from "@/modules/organizations/organization-teams/browser-ui";
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
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization settings · {organization.organization.login}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
          >
            <UsersRound className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization teams
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Manage direct membership, maintainers, visibility, and the team
              hierarchy. Repository access remains an independent grant.
            </p>
          </div>
        </div>
        <div className="mt-9">
          <OrganizationTeamsManager
            canManageAll={eligibility.membership.role === "owner"}
            currentAccountId={session.account.accountId}
            organizationLogin={organization.organization.login}
            teams={teams}
          />
        </div>
      </section>
    </main>
  );
}
