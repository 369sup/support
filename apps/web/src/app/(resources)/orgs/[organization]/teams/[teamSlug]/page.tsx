import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import {
  getOrganizationTeam,
  listTeamMembers,
} from "@/modules/organizations/organization-teams/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export default async function OrganizationTeamPage({
  params,
}: Readonly<{
  params: Promise<{ organization: string; teamSlug: string }>;
}>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const organization = await getOrganizationByLogin(routeParams.organization);

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

  const teamResult = await getOrganizationTeam({
    actorAccountId: session.account.accountId,
    organizationId: organization.organization.organizationId,
    teamSlug: routeParams.teamSlug,
  });
  if (teamResult.status !== "found") {
    notFound();
  }

  const membersResult = await listTeamMembers({
    actorAccountId: session.account.accountId,
    teamId: teamResult.team.teamId,
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

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization teams
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <ArrowLeft aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              {teamResult.team.name}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Inspect team visibility, direct members, and maintainers.
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-4">
          <div className="rounded-xl border border-white/15 bg-[#0a1624] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Team slug
                </p>
                <p className="font-mono text-lg text-slate-200">
                  {teamResult.team.slug}
                </p>
              </div>
              <span className="rounded-full border border-slate-600 px-2 py-1 text-xs capitalize text-slate-400">
                {teamResult.team.visibility}
              </span>
              {teamResult.team.visibility === "visible" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-400">
                  <Eye aria-hidden="true" className="size-3.5" />
                  Visible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-400">
                  <EyeOff aria-hidden="true" className="size-3.5" />
                  Secret
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {teamResult.team.description || "No team description."}
            </p>

            {teamResult.team.parentTeamId === null ? null : (
              <p className="mt-4 text-sm text-slate-400">
                Parent team ID: {teamResult.team.parentTeamId}
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Members
                </h2>
                <Link
                  className="text-sm text-emerald-300 underline decoration-dashed"
                  href={`/orgs/${organization.organization.login}/teams`}
                >
                  All teams
                </Link>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {members.length} total member{members.length === 1 ? "" : "s"}
              </p>
            </div>
            {members.length === 0 ? (
              <p
                className="px-5 py-4 text-sm text-slate-500"
                role="status"
              >
                No direct members.
              </p>
            ) : (
              <ul className="divide-y divide-white/10">
                {members.map((member) => (
                  <li
                    className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm"
                    key={member.membership.teamMembershipId}
                  >
                    <span className="font-medium text-slate-200">
                      @{member.username}
                    </span>
                    {member.isMaintainer ? (
                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                        Maintainer
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
