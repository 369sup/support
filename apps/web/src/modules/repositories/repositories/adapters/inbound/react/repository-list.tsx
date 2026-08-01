import { Archive, FolderKanban } from "lucide-react";

import type { RepositoryBrowserView } from "./repository-browser.types";

export function RepositoryList({
  emptyMessage = "No repositories match this view.",
  repositories,
}: Readonly<{
  emptyMessage?: string;
  repositories: readonly RepositoryBrowserView[];
}>) {
  if (repositories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <FolderKanban
          aria-hidden="true"
          className="mx-auto size-8 text-muted-foreground"
        />
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {repositories.map((repository) => {
        const href = `/${repository.owner.login}/${repository.name}`;
        return (
          <li className="px-5 py-5" key={repository.repositoryId}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    className="font-semibold text-primary hover:underline"
                    href={href}
                  >
                    {repository.owner.login}/{repository.name}
                  </a>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
                    {repository.visibility}
                  </span>
                  {repository.lifecycleState === "archived" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                      <Archive aria-hidden="true" className="size-3" />
                      Archived
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                  {repository.description === ""
                    ? "No description provided."
                    : repository.description}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="capitalize">{repository.permission} access</p>
                <p className="mt-1">
                  Updated{" "}
                  <time dateTime={repository.updatedAt}>
                    {new Date(repository.updatedAt).toLocaleDateString("en-US")}
                  </time>
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
