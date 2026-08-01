"use client";

import { usePathname } from "next/navigation";
import {
  Archive,
  CircleDot,
  FolderKanban,
  Gauge,
  MessagesSquare,
  Settings,
  Star,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import type { RepositoryBrowserView } from "./repository-browser.types";

export type RepositoryTab =
  | "overview"
  | "issues"
  | "discussions"
  | "projects"
  | "activity"
  | "stars"
  | "watchers"
  | "settings";

const tabs = [
  { id: "overview", label: "Overview", suffix: "", icon: FolderKanban },
  { id: "issues", label: "Issues", suffix: "/issues", icon: CircleDot },
  {
    id: "discussions",
    label: "Discussions",
    suffix: "/discussions",
    icon: MessagesSquare,
  },
  { id: "projects", label: "Projects", suffix: "/projects", icon: Gauge },
  { id: "activity", label: "Activity", suffix: "/activity", icon: Gauge },
  { id: "stars", label: "Stars", suffix: "/stargazers", icon: Star },
  { id: "watchers", label: "Watchers", suffix: "/watchers", icon: Users },
  { id: "settings", label: "Settings", suffix: "/settings", icon: Settings },
] as const;

export function RepositoryShell({
  activeTab,
  actions,
  repository,
}: Readonly<{
  activeTab?: RepositoryTab;
  actions?: ReactNode;
  repository: RepositoryBrowserView;
}>) {
  const basePath = `/${repository.owner.login}/${repository.name}`;
  const pathname = usePathname();
  const selectedTab =
    activeTab ??
    (tabs
      .toReversed()
      .find((tab) =>
        tab.suffix === ""
          ? pathname === basePath
          : pathname.startsWith(`${basePath}${tab.suffix}`),
      )?.id) ??
    "overview";
  return (
    <header className="border-b border-border bg-card/70">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-5 sm:px-8">
        <FolderKanban aria-hidden="true" className="size-5 text-muted-foreground" />
        <div className="min-w-0 text-lg">
          <a
            className="text-muted-foreground hover:text-foreground"
            href={`/${repository.owner.login}`}
          >
            {repository.owner.login}
          </a>
          <span className="mx-1 text-muted-foreground">/</span>
          <a className="font-semibold hover:underline" href={basePath}>
            {repository.name}
          </a>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
          {repository.visibility}
        </span>
        {repository.lifecycleState === "archived" ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
            <Archive aria-hidden="true" className="size-3" />
            Archived
          </span>
        ) : null}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
          {repository.permission}
        </span>
        {actions === undefined ? null : (
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        )}
      </div>

      {repository.lifecycleState === "archived" ? (
        <div
          className="border-y border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-800 dark:text-amber-200"
          role="status"
        >
          This repository was archived and is read-only. Existing collaboration
          content remains available.
        </div>
      ) : null}

      <nav
        aria-label="Repository navigation"
        className="mx-auto w-full max-w-7xl overflow-x-auto px-4 sm:px-8"
      >
        <ul className="flex min-w-max gap-1">
          {tabs
            .filter(
              (tab) =>
                tab.id !== "settings" || repository.permission === "admin",
            )
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === selectedTab;
              return (
                <li key={tab.id}>
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "flex items-center gap-2 border-b-2 border-primary px-3 py-3 text-sm font-semibold text-foreground"
                        : "flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:border-border hover:text-foreground"
                    }
                    href={`${basePath}${tab.suffix}`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {tab.label}
                  </a>
                </li>
              );
            })}
        </ul>
      </nav>
    </header>
  );
}
