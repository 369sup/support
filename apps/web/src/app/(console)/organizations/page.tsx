import Link from "next/link";
import { ArrowRight, Building2, Plus } from "lucide-react";

import { buildLinkHref } from "@/app/_route-contracts/route-contract";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { listActiveOrganizationMembershipsForAccount } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";
import { buttonVariants } from "@support/shadcn/ui/button-variants";

export default async function OrganizationsPage() {
  const session = await requireCurrentSession();
  const memberships = await listActiveOrganizationMembershipsForAccount(
    session.account.accountId,
  );
  const organizations = (
    await Promise.all(
      memberships.map(async (membership) => {
        const result = await getOrganizationReferenceById(
          membership.organizationId,
        );
        return result.status === "found"
          ? { membership, organization: result.organization }
          : null;
      }),
    )
  )
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) =>
      left.organization.displayName.localeCompare(
        right.organization.displayName,
      ),
    );

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
              Account access
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">
              Organizations
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Organizations where your account has an active membership.
            </p>
          </div>
          <Link
            className={buttonVariants()}
            href={buildLinkHref("page-organizations-new", {})}
          >
            <Plus aria-hidden="true" className="size-4" />
            New organization
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Organization
            </p>
            <p className="text-xs text-slate-500">
              {organizations.length} total
            </p>
          </div>
          {organizations.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Building2
                aria-hidden="true"
                className="mx-auto size-8 text-slate-600"
              />
              <h2 className="mt-4 font-semibold text-slate-100">
                No organizations yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Create an organization to start managing teams and repositories.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {organizations.map(({ membership, organization }) => (
                <li key={organization.organizationId}>
                  <Link
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
                    href={buildLinkHref(
                      "page-orgs-organization-repositories",
                      { organization: organization.login },
                    )}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                      <Building2 aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-100">
                        {organization.displayName}
                      </span>
                      <span className="mt-1 block truncate text-sm text-slate-500">
                        @{organization.login}
                      </span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {membership.role}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
