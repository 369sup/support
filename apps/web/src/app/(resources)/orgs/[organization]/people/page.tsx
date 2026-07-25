import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { checkOrganizationContextEligibility, listActiveOrganizationMembershipsForOrganization } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export default async function OrganizationPeoplePage({
  params,
}: Readonly<{ params: Promise<{ organization: string }> }>) {
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

  const members = await listActiveOrganizationMembershipsForOrganization(
    organization.organization.organizationId,
  );

  const membersWithUsername = await Promise.all(
    members.map(async (member) => {
      const account = await getAccountReferenceById(member.accountId);
      return {
        ...member,
        username:
          account.status === "found"
            ? account.account.username
            : member.accountId,
      };
    }),
  );

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Organization navigation · {organization.organization.login}
        </p>

        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <Users aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              Organization people
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              Active members in this organization visible to the current actor.
            </p>
          </div>
        </div>

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-300">
              Members ({membersWithUsername.length})
            </h2>
          </div>
          {membersWithUsername.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-slate-500"
              role="status"
            >
              No active members are visible.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {membersWithUsername.map((member) => (
                <li
                  className="grid items-center gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5"
                  key={member.membershipId}
                >
                  <Link
                    className="truncate text-sm font-medium text-slate-100 underline decoration-dashed underline-offset-4 hover:text-white"
                    href={`/${member.username}`}
                  >
                    @{member.username}
                  </Link>
                  <span
                    className="w-fit rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-400 capitalize"
                  >
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
