import Link from "next/link";

import { AccountMenu } from "@/app/account-menu";
import { readBrowserSessionToken } from "@/app/_authentication/browser-session-cookie";
import { requireCurrentSession } from "@/app/_authentication/current-session";
import { DashboardContextSwitcher } from "@/app/dashboard-context-switcher";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { listBrowserAccountSessions } from "@/modules/identity/authentication/server-api";
import {
  listAvailableDashboardContexts,
  restoreLastValidDashboardContext,
} from "@/modules/projections/dashboard/server-api";

export const dynamic = "force-dynamic";

const consoleNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/repositories", label: "Repositories" },
  { href: "/settings", label: "Settings" },
];

export default async function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireCurrentSession();
  const [sessionsResult, availableContexts, selectedContext, enterpriseAccess] =
    await Promise.all([
      listBrowserAccountSessionsFromCookie(),
      listAvailableDashboardContexts(session),
      restoreLastValidDashboardContext(session),
      authorizeEnterpriseAdministration({
        accountId: session.account.accountId,
        enterpriseId: "enterprise_acme",
      }),
    ]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex min-h-18 items-center gap-5 border-b px-5 sm:px-8">
        <Link
          className="shrink-0 text-lg font-semibold tracking-tight"
          href="/dashboard"
        >
          Support
        </Link>
        <DashboardContextSwitcher
          available={availableContexts}
          current={selectedContext.context}
        />
        <nav
          aria-label="Console"
          className="flex min-w-0 flex-1 gap-5 overflow-x-auto text-sm text-muted-foreground"
        >
          {consoleNavigation.map((item) => (
            <Link
              className="shrink-0 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <AccountMenu
          currentUsername={session.account.username}
          enterpriseHref={
            enterpriseAccess.status === "allowed"
              ? "/enterprises/acme-enterprise"
              : null
          }
          sessions={sessionsResult}
        />
      </header>
      {children}
    </div>
  );
}

async function listBrowserAccountSessionsFromCookie() {
  const browserToken = await readBrowserSessionToken();
  if (browserToken === null) {
    return [];
  }
  const result = await listBrowserAccountSessions(browserToken);
  return result.status === "found" ? result.sessions : [];
}
