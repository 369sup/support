import Link from "next/link";

import { ConsoleNavigation } from "../_route-contracts/console-navigation";
import { AccountMenu } from "@/modules/identity/authentication/browser-ui";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { DashboardContextSwitcher } from "@/modules/projections/dashboard/browser-ui";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import {
  listAvailableDashboardContexts,
  restoreLastValidDashboardContext,
} from "@/modules/projections/dashboard/server-api";
import { buildLinkHref } from "../_route-contracts/route-contract";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({
  children,
  header,
  navigation: navigationSlot,
  sidebar,
  modal,
}: Readonly<{
  children: React.ReactNode;
  header?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  const session = await requireCurrentSession();
  const [availableContexts, selectedContext, enterpriseAccess] =
    await Promise.all([
      listAvailableDashboardContexts(session),
      restoreLastValidDashboardContext(session),
      authorizeEnterpriseAdministration({
        accountId: session.account.accountId,
        enterpriseId: "enterprise_acme",
      }),
    ]);
  const organizationLogin =
    selectedContext.context.kind === "organization"
      ? selectedContext.context.login
      : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-[#0d1117] text-slate-100">
      <header className="flex min-h-16 items-center gap-4 border-b border-white/10 px-4 sm:px-6">
        {header}
        <Link
          className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-white"
          href="/dashboard"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/10 font-mono text-base text-emerald-400"
          >
            S
          </span>
          <span className="hidden text-lg sm:inline">Support</span>
        </Link>
        <DashboardContextSwitcher
          available={availableContexts}
          current={selectedContext.context}
        />
        <div className="min-w-0 flex-1" />
        <AccountMenu
          currentUsername={session.account.username}
          enterpriseHref={
            enterpriseAccess.status === "allowed"
              ? buildLinkHref("page-enterprises-slug", {
                  slug: "acme-enterprise",
              })
              : null
          }
        />
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#0a1624]/40 px-3 py-6 lg:block">
          {sidebar}
          <ConsoleNavigation
            ariaLabel="Console"
            navigationSlot={navigationSlot}
            {...(organizationLogin === undefined
              ? {}
              : { organizationLogin })}
          />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-white/10 px-4 py-2 lg:hidden">
            <ConsoleNavigation
              ariaLabel="Console mobile"
              isHorizontal
              navigationSlot={navigationSlot}
              {...(organizationLogin === undefined
                ? {}
                : { organizationLogin })}
            />
          </div>
          {children}
        </div>
      </div>
      {modal}
    </div>
  );
}
