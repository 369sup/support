import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/app/_authentication/current-session";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";

export default async function RepositoriesPage() {
  const session = await requireCurrentSession();
  const view = await getDashboardRepositoryView(session);

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          Selected {view.context.kind} context
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Repositories
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Active repositories visible to @{session.account.username}. Context
          selection narrows the owner scope but never grants access.
        </p>
        <Separator className="my-10" />
        {view.repositories.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            No active repositories are available.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {view.repositories.map((repository) => (
              <li className="p-5 sm:p-6" key={repository.repositoryId}>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-lg font-semibold">
                    {repository.ownerLogin}/{repository.name}
                  </h2>
                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                    {repository.visibility}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {repository.permission}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {repository.description}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
