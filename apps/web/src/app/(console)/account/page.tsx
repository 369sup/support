import { Separator } from "@support/shadcn/ui/separator";

import { requireCurrentSession } from "@/modules/identity/authentication/server-api";

export default async function AccountPage() {
  const session = await requireCurrentSession();

  return (
    <main className="flex flex-1 px-5 py-16 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-medium text-muted-foreground">
          Authenticated account
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
          Account
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          This identity is resolved from the active HttpOnly browser session.
        </p>
        <Separator className="my-10" />
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Username</dt>
            <dd className="mt-1 font-mono text-base">
              @{session.account.username}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Account ID</dt>
            <dd className="mt-1 font-mono text-base">
              {session.account.accountId}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Account type</dt>
            <dd className="mt-1 text-base">{session.account.accountType}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Usage</dt>
            <dd className="mt-1 text-base">{session.account.usage}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
