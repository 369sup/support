import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { AccountMenu } from "@/modules/identity/authentication/browser-ui";
import { readBrowserSessionToken } from "@/modules/identity/authentication/server-api";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { DashboardContextSwitcher } from "@/modules/projections/dashboard/browser-ui";
import { authorizeEnterpriseAdministration } from "@/modules/enterprises/enterprise-roles/server-api";
import { listBrowserAccountSessions } from "@/modules/identity/authentication/server-api";
import {
  listAvailableDashboardContexts,
  restoreLastValidDashboardContext,
} from "@/modules/projections/dashboard/server-api";

export const dynamic = "force-dynamic";

const consoleNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: FolderKanban },
] satisfies readonly ConsoleNavigationItem[];

type ConsoleNavigationItem = Readonly<{
  href: string;
  label: string;
  icon: LucideIcon;
}>;

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
  const navigation =
    selectedContext.context.kind === "organization"
      ? [
          ...consoleNavigation,
          {
            href: `/organizations/${selectedContext.context.login}/settings/teams`,
            label: "Teams",
            icon: UsersRound,
          },
          {
            href: `/organizations/${selectedContext.context.login}/settings/roles`,
            label: "Roles",
            icon: ShieldCheck,
          },
        ]
      : consoleNavigation;

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
              ? "/enterprises/acme-enterprise"
              : null
          }
          sessions={sessionsResult}
        />
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#0a1624]/40 px-3 py-6 lg:block">
          {sidebar}
          <ConsoleNavigation
            ariaLabel="Console"
            navigation={navigation}
            navigationSlot={navigationSlot}
          />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-white/10 px-4 py-2 lg:hidden">
            <ConsoleNavigation
              ariaLabel="Console mobile"
              isHorizontal
              navigation={navigation}
              navigationSlot={navigationSlot}
            />
          </div>
          {children}
        </div>
      </div>
      {modal}
    </div>
  );
}

function ConsoleNavigation({
  ariaLabel,
  isHorizontal = false,
  navigation,
  navigationSlot,
}: Readonly<{
  ariaLabel: string;
  isHorizontal?: boolean;
  navigation: readonly ConsoleNavigationItem[];
  navigationSlot?: React.ReactNode;
}>) {
  return (
    <nav
      aria-label={ariaLabel}
      className={
        isHorizontal
          ? "flex gap-2 overflow-x-auto"
          : "grid gap-1 text-sm"
      }
    >
      {navigationSlot}
      {navigation.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            className={
              isHorizontal
                ? "inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                : "flex items-center gap-3 rounded-md px-3 py-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            }
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
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
