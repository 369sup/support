import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import {
  checkOrganizationContextEligibility,
  listActiveOrganizationMembershipsForOrganization,
} from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

type MemberPrivilegeView = Readonly<{
  memberId: string;
  role: "member" | "owner";
  source: "direct" | "enterprise-managed" | "identity-provider-group";
  username: string;
  accountId: string;
}>;

function readableMembershipSource(
  source: MemberPrivilegeView["source"],
): string {
  if (source === "direct") {
    return "Direct membership";
  }
  if (source === "enterprise-managed") {
    return "Enterprise managed";
  }
  return "Identity provider group";
}

function privilegeSummary(role: "member" | "owner"): string {
  if (role === "owner") {
    return "Can manage members, teams, repositories, and sensitive organization settings.";
  }
  return "Can access organization repositories and participate in team-based workflows.";
}

export default async function MemberPrivilegesPage({
  params,
}: Readonly<{
  params: Promise<{ login: string }>;
}>) {
  const session = await requireCurrentSession();
  const routeParams = await params;
  const organization = await getOrganizationByLogin(routeParams.login);
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

  const members = await listActiveOrganizationMembershipsForOrganization(
    organization.organization.organizationId,
  );
  const membersWithUsername = await Promise.all(
    members.map(async (member) => {
      const account = await getAccountReferenceById(member.accountId);
      return {
        accountId: member.accountId,
        memberId: member.membershipId,
        role: member.role,
        source: member.source,
        username:
          account.status === "found"
            ? account.account.username
            : member.accountId,
      } satisfies MemberPrivilegeView;
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
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization member privileges
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              This screen shows effective organization privileges in the current
              model. Permission edits remain planned, but visibility is available
              for owners and members in this build.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="grid gap-2 border-b border-white/10 px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase sm:grid-cols-[minmax(0,1.3fr)_auto_auto] sm:grid">
            <span>Member</span>
            <span>Role</span>
            <span>Privilege policy</span>
          </div>

          {membersWithUsername.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-slate-500"
              role="status"
            >
              No active members are available.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {membersWithUsername.map((member) => (
                <li
                  className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1.3fr)_auto_auto]"
                  key={member.memberId}
                >
                  <div className="min-w-0">
                    <Link
                      className="truncate text-sm font-medium text-slate-100 underline decoration-dashed underline-offset-4 hover:text-white"
                      href={`/${member.username}`}
                    >
                      @{member.username}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {readableMembershipSource(member.source)}
                    </p>
                  </div>
                  <span
                    className="w-fit rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 capitalize"
                    aria-label={`Role ${member.role} for ${member.username}`}
                  >
                    {member.role}
                  </span>
                  <p className="text-sm text-slate-300">
                    {privilegeSummary(member.role)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {eligibility.membership.role !== "owner" ? null : (
          <p className="mt-4 text-xs text-slate-500">
            Only organization owners can currently manage privilege policy values.
          </p>
        )}
      </section>
    </main>
  );
}
