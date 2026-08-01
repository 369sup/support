import { ArchiveRestore, FolderX } from "lucide-react";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import {
  listDeletedRepositoriesForRestoration,
  restoreDeletedRepository,
} from "@/modules/repositories/repositories/server-api";

async function restorePersonalRepositoryAction(
  formData: FormData,
): Promise<never> {
  "use server";
  const session = await requireCurrentSession();
  const ownerId = readFormString(formData, "ownerId");
  if (
    session.account.accountType !== "personal" ||
    ownerId !== session.account.accountId
  ) {
    redirect("/settings/repositories?repository=permission-denied");
  }
  const result = await restoreDeletedRepository({
    actorAccountId: session.account.accountId,
    ownerId,
    name: readFormString(formData, "repository"),
    confirmation: readFormString(formData, "confirmation"),
  });
  redirect(`/settings/repositories?repository=${result.status}`);
}

export default async function DeletedPersonalRepositoriesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ repository?: string }>;
}>) {
  const session = await requireCurrentSession();
  const query = await searchParams;
  const result = await listDeletedRepositoriesForRestoration({
    actorAccountId: session.account.accountId,
    ownerId: session.account.accountId,
  });
  const repositories =
    result.status === "found" ? result.repositories : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Personal settings
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ArchiveRestore aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em]">
              Deleted repositories
            </h1>
            <p className="mt-4 text-muted-foreground">
              Restore eligible repositories owned by your personal account.
              Team permissions are never restored.
            </p>
          </div>
        </div>

        {query.repository === undefined ? null : (
          <p className="mt-6 rounded-lg border border-border bg-card px-4 py-3 text-sm" role="status">
            Repository result: {query.repository.replaceAll("-", " ")}.
          </p>
        )}

        <DeletedRepositoryList
          action={restorePersonalRepositoryAction}
          repositories={repositories}
        />
      </section>
    </main>
  );
}

function DeletedRepositoryList({
  action,
  repositories,
}: Readonly<{
  action: (formData: FormData) => Promise<never>;
  repositories: readonly {
    name: string;
    owner:
      | { kind: "personal"; accountId: string; login: string }
      | { kind: "organization"; organizationId: string; login: string };
    deletedAt: string;
    restoreUntil: string;
    isRestorable: boolean;
  }[];
}>) {
  if (repositories.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
        <FolderX aria-hidden="true" className="mx-auto size-8" />
        <p className="mt-3 text-sm">No deleted repositories are available.</p>
      </div>
    );
  }
  return (
    <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
      {repositories.map((repository) => {
        const ownerId =
          repository.owner.kind === "personal"
            ? repository.owner.accountId
            : repository.owner.organizationId;
        const fullName = `${repository.owner.login}/${repository.name}`;
        return (
          <li className="p-5" key={fullName}>
            <h2 className="font-semibold">{fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deleted {new Date(repository.deletedAt).toLocaleString("en-US")} ·
              restore through{" "}
              {new Date(repository.restoreUntil).toLocaleString("en-US")}
            </p>
            <form action={action} className="mt-4 flex flex-wrap gap-3">
              <input name="ownerId" type="hidden" value={ownerId} />
              <input name="repository" type="hidden" value={repository.name} />
              <input
                aria-label={`Type ${fullName} to confirm`}
                className="h-9 min-w-64 rounded-md border border-input bg-background px-3 text-sm"
                disabled={!repository.isRestorable}
                name="confirmation"
                placeholder={fullName}
                required
              />
              <button
                className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!repository.isRestorable}
                type="submit"
              >
                Restore
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
