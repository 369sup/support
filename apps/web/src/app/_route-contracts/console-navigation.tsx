"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { buildLinkHref } from "./route-contract";

type ConsoleNavigationProps = Readonly<{
  ariaLabel: string;
  isHorizontal?: boolean;
  navigationSlot?: React.ReactNode;
  organizationLogin?: string;
}>;

export function ConsoleNavigation({
  ariaLabel,
  isHorizontal = false,
  navigationSlot,
  organizationLogin,
}: ConsoleNavigationProps) {
  const pathname = usePathname();
  const navigation = [
    {
      href: buildLinkHref("page-dashboard", {}),
      icon: LayoutDashboard,
      label: "儀表板",
    },
    {
      href: buildLinkHref("page-repositories", {}),
      icon: FolderKanban,
      label: "儲存庫",
    },
    {
      href: buildLinkHref("page-organizations", {}),
      icon: Building2,
      label: "組織",
    },
    {
      href: buildLinkHref("page-enterprises", {}),
      icon: Landmark,
      label: "企業",
    },
    ...(organizationLogin === undefined
      ? []
      : [
          {
            href: buildLinkHref(
              "page-organizations-login-settings-teams",
              { login: organizationLogin },
            ),
            icon: UsersRound,
            label: "團隊",
          },
          {
            href: buildLinkHref(
              "page-organizations-login-settings-roles",
              { login: organizationLogin },
            ),
            icon: ShieldCheck,
            label: "角色",
          },
        ]),
  ];

  return (
    <nav
      aria-label={ariaLabel}
      className={
        isHorizontal ? "flex gap-2 overflow-x-auto" : "grid gap-1 text-sm"
      }
    >
      {navigationSlot}
      {navigation.map((item) => {
        const Icon = item.icon;
        const isCurrent =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            pathname.startsWith(`${item.href}/`));

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            className={
              isHorizontal
                ? `inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isCurrent
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                : `flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isCurrent
                      ? "bg-white/10 font-medium text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
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
