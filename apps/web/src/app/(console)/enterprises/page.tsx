import Link from "next/link";
import { ArrowRight, Landmark, Plus } from "lucide-react";

import { buildLinkHref } from "@/app/_route-contracts/route-contract";
import { listActiveEnterpriseAffiliationsForAccount } from "@/modules/enterprises/enterprise-memberships/server-api";
import { getEnterpriseReferenceById } from "@/modules/enterprises/enterprises/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { buttonVariants } from "@support/shadcn/ui/button-variants";

export default async function EnterprisesPage() {
  const session = await requireCurrentSession();
  const affiliations = await listActiveEnterpriseAffiliationsForAccount(
    session.account.accountId,
  );
  const enterprises = (
    await Promise.all(
      affiliations.map(async (affiliation) => {
        const result = await getEnterpriseReferenceById(
          affiliation.enterpriseId,
        );
        return result.status === "found"
          ? { affiliation, enterprise: result.enterprise }
          : null;
      }),
    )
  )
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) =>
      left.enterprise.displayName.localeCompare(right.enterprise.displayName),
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
              Enterprises
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Enterprises where your account has an active affiliation.
            </p>
          </div>
          <Link
            className={buttonVariants()}
            href={buildLinkHref("page-enterprises-new", {})}
          >
            <Plus aria-hidden="true" className="size-4" />
            New enterprise
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Enterprise
            </p>
            <p className="text-xs text-slate-500">
              {enterprises.length} total
            </p>
          </div>
          {enterprises.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Landmark
                aria-hidden="true"
                className="mx-auto size-8 text-slate-600"
              />
              <h2 className="mt-4 font-semibold text-slate-100">
                No enterprises yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Create an enterprise to group organizations under one account.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {enterprises.map(({ affiliation, enterprise }) => (
                <li key={enterprise.enterpriseId}>
                  <Link
                    className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
                    href={buildLinkHref("page-enterprises-slug", {
                      slug: enterprise.slug,
                    })}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                      <Landmark aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-100">
                        {enterprise.displayName}
                      </span>
                      <span className="mt-1 block truncate text-sm text-slate-500">
                        {enterprise.slug}
                      </span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {affiliation.affiliation === "direct"
                        ? "direct"
                        : "organization"}
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
