import { notFound } from "next/navigation";

import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/app/_authentication/current-session";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  getEnterpriseBySlug,
  listEnterpriseOrganizations,
} from "@/modules/enterprises/enterprises/server-api";

export default async function EnterprisePage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const session = await requireCurrentSession();
  const enterprise = await getEnterpriseBySlug((await params).slug);
  if (enterprise.status !== "found") {
    notFound();
  }
  const decision = await authorizeEnterpriseAdministration({
    accountId: session.account.accountId,
    enterpriseId: enterprise.enterprise.enterpriseId,
  });
  if (decision.status !== "allowed") {
    return (
      <main className="grid flex-1 place-items-center px-6">
        <section className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold">Enterprise access denied</h1>
          <p className="mt-4 text-muted-foreground">
            Enterprise affiliation alone does not grant administration access.
          </p>
        </section>
      </main>
    );
  }
  const result = await listEnterpriseOrganizations(
    enterprise.enterprise.slug,
  );
  const organizations =
    result.status === "found" ? result.organizations : [];

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          Enterprise administration · {decision.roleName}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          {enterprise.enterprise.displayName}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Read-only organization ownership summary. Enterprises are not
          repository owners and are intentionally absent from the Dashboard
          context switcher.
        </p>
        <Separator className="my-10" />
        <ul className="grid gap-4 sm:grid-cols-2">
          {organizations.map((organization) => (
            <li className="rounded-xl border p-5" key={organization.organizationId}>
              <h2 className="font-semibold">{organization.displayName}</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {organization.login}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
