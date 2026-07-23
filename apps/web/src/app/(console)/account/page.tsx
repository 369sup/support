import { Separator } from "@support/shadcn/ui/separator";

import { mockCredentials } from "@/app/mock-auth-contract";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";

export default async function AccountPage() {
  const result = await getPersonalAccountByUsername(mockCredentials.username);

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-medium text-muted-foreground">
          Development account
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Account
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Public account identity supplied by the first active identity
          bounded-context query.
        </p>
        <Separator className="my-10" />
        {result.ok ? (
          <dl className="grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Username</dt>
              <dd className="mt-1 font-mono text-base">@{result.account.username}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Account ID</dt>
              <dd className="mt-1 font-mono text-base">
                {result.account.accountId}
              </dd>
            </div>
          </dl>
        ) : (
          <p role="status" className="text-sm text-muted-foreground">
            The development account is unavailable.
          </p>
        )}
      </section>
    </main>
  );
}
