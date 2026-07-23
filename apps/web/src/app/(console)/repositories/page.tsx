import { Separator } from "@support/shadcn/ui/separator";

import { mockCredentials } from "@/app/mock-auth-contract";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { listActivePublicRepositoriesForPersonalOwner } from "@/modules/repositories/repositories/server-api";

export default async function RepositoriesPage() {
  const accountResult = await getPersonalAccountByUsername(
    mockCredentials.username,
  );
  const repositories = accountResult.ok
    ? await listActivePublicRepositoriesForPersonalOwner(accountResult.account)
    : [];

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-medium text-muted-foreground">
          Public development data
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Repositories
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Active public repositories resolved through the identity and
          repositories bounded-context APIs.
        </p>
        <Separator className="my-10" />
        {repositories.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            No active public repositories are available.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {repositories.map((repository) => (
              <li className="p-5 sm:p-6" key={repository.repositoryId}>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-mono text-lg font-semibold">
                    {repository.ownerUsername}/{repository.name}
                  </h2>
                  <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                    {repository.visibility}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {repository.description}
                </p>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  Updated {repository.updatedAt.slice(0, 10)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
