import { Building2, FolderKanban, User2 } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { requireCurrentSession } from "@/modules/identity/authentication/server-api";
import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { getUserProfile } from "@/modules/identity/profiles/server-api";
import { toggleUserFollow } from "@/modules/identity/social-graph/server-api";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";
import {
  listActiveRepositoriesForOwner,
  type RepositoryCandidateReference,
} from "@/modules/repositories/repositories/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";

type OwnerLookupResult =
  | Readonly<{ kind: "organization"; login: string; displayName: string; id: string }>
  | Readonly<{ kind: "account"; login: string; displayName: string; id: string }>;
type OwnerRepository = Awaited<ReturnType<typeof listActiveRepositoriesForOwner>>[number];
type RepositoryWithPermission = OwnerRepository & {
  permission: "admin" | "maintain" | "write" | "triage" | "read";
};

type RepositoryForPermissionLookup = RepositoryCandidateReference;

function mapRepositoryForPermissionLookup(
  repository: OwnerRepository,
): RepositoryForPermissionLookup {
  return {
    repositoryId: repository.repositoryId,
    owner:
      repository.owner.kind === "personal"
        ? {
            kind: "personal" as const,
            accountId: repository.owner.accountId,
            login: repository.owner.login,
          }
        : {
            kind: "organization" as const,
            organizationId: repository.owner.organizationId,
            login: repository.owner.login,
          },
    name: repository.name,
    description: repository.description,
    visibility: repository.visibility,
    lifecycleState: repository.lifecycleState,
    updatedAt: repository.updatedAt,
  };
}

async function resolveOwnerByLogin(
  owner: string,
): Promise<OwnerLookupResult | null> {
  const organization = await getOrganizationByLogin(owner);
  if (organization.status === "found") {
    return {
      kind: "organization",
      id: organization.organization.organizationId,
      login: organization.organization.login,
      displayName: organization.organization.displayName,
    };
  }

  const account = await getPersonalAccountByUsername(owner);
  if (!account.isSuccessful) {
    return null;
  }

  return {
    kind: "account",
    id: account.account.accountId,
    login: account.account.username,
    displayName: account.account.username,
  };
}

async function toggleFollowAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const login = readFormString(formData, "owner").trim();
  const account = await getPersonalAccountByUsername(login);
  if (!account.isSuccessful) {
    redirect(`/${login}?follow=account-not-found`);
  }

  const result = await toggleUserFollow({
    followerAccountId: session.account.accountId,
    followedAccountId: account.account.accountId,
  });
  revalidatePath(`/${login}`);
  let followStatus: string = result.status;
  if (result.status === "updated") {
    followStatus = result.follow.isFollowing ? "following" : "unfollowed";
  }
  redirect(`/${login}?follow=${followStatus}`);
}

export default async function OwnerPage({
  params,
}: Readonly<{
  params: Promise<{ owner: string }>;
}>) {
  const routeParams = await params;
  const [session, owner] = await Promise.all([
    requireCurrentSession(),
    resolveOwnerByLogin(routeParams.owner),
  ]);

  if (owner === null) {
    notFound();
  }

  const [repositories, profileResult] = await Promise.all([
    listActiveRepositoriesForOwner(owner.id),
    owner.kind === "account"
      ? getUserProfile({
          accountId: owner.id,
          isOwner: session.account.accountId === owner.id,
        })
      : Promise.resolve({ status: "profile-not-found" } as const),
  ]);
  const profile =
    profileResult.status === "found" ? profileResult.profile : null;

  const visibleRepositories = (
    await Promise.all(
      repositories.map(async (repository) => {
        const permission = await resolveEffectiveRepositoryPermission({
          actor: session.account,
          repository: mapRepositoryForPermissionLookup(repository),
        });
        if (!permission.isAllowed) {
          return null;
        }
        return {
          ...repository,
          permission:
            permission.permission ??
            (repository.visibility === "public" ? "read" : null),
        };
      }),
    )
  ).filter(
    (repository): repository is RepositoryWithPermission =>
      repository !== null && repository.permission !== null,
  );

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <p className="font-mono text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
          Owner profile · {owner.login}
        </p>
        <div className="mt-3 flex items-start gap-4">
          <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            {owner.kind === "organization" ? (
              <Building2 aria-hidden="true" className="size-5" />
            ) : (
              <User2 aria-hidden="true" className="size-5" />
            )}
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
              {profile?.displayName ?? owner.displayName}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">
              {profile?.bio === "" || profile === null
                ? "Repositories visible to the current session for"
                : profile.bio}{" "}
              <span className="font-semibold text-white">@{owner.login}</span>
            </p>
            {profile === null ? null : (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {profile.location === "" ? null : <span>{profile.location}</span>}
                {profile.pronouns === "" ? null : <span>{profile.pronouns}</span>}
                {profile.status === null ? null : (
                  <span>
                    {profile.status.emoji} {profile.status.message}
                  </span>
                )}
              </div>
            )}
            {owner.kind === "account" &&
            owner.id !== session.account.accountId ? (
              <form action={toggleFollowAction} className="mt-5">
                <input name="owner" type="hidden" value={owner.login} />
                <button
                  className="rounded-lg border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/10"
                  type="submit"
                >
                  Follow / unfollow
                </button>
              </form>
            ) : null}
          </div>
        </div>

        {profile === null || profile.achievements.length === 0 ? null : (
          <section className="mt-8" aria-labelledby="achievements-heading">
            <h2
              className="text-sm font-medium text-slate-300"
              id="achievements-heading"
            >
              Achievements
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.achievements.map((achievement) => (
                <li
                  className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4"
                  key={achievement.slug}
                >
                  <p className="text-sm font-semibold text-amber-100">
                    {achievement.title}
                  </p>
                  <p className="mt-1 text-xs tracking-wider text-amber-300/70 uppercase">
                    {achievement.tier}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {achievement.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-9 overflow-hidden rounded-xl border border-white/15 bg-[#0a1624]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-medium text-slate-300">
              Repositories ({visibleRepositories.length})
            </h2>
          </div>
          {visibleRepositories.length === 0 ? (
            <p
              className="px-5 py-10 text-center text-sm text-slate-500"
              role="status"
            >
              No repositories are visible to your current session.
            </p>
          ) : (
            <ul className="divide-y divide-white/10">
              {visibleRepositories.map((repository) => (
                <li
                  className="grid gap-4 px-4 py-5 sm:grid-cols-[minmax(0,1.5fr)_auto_auto] sm:items-center sm:gap-5 sm:px-5"
                  key={repository.repositoryId}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderKanban
                        aria-hidden="true"
                        className="size-4 shrink-0 text-slate-500"
                      />
                      <Link
                        className="truncate font-mono text-sm font-semibold text-slate-100 underline decoration-dashed underline-offset-4 hover:text-white"
                        href={`/${owner.login}/${repository.name}`}
                      >
                        {repository.owner.login}/{repository.name}
                      </Link>
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {repository.description}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-slate-600 px-2.5 py-1 text-xs capitalize text-slate-400">
                    {repository.visibility}
                  </span>
                  <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium uppercase text-emerald-300">
                    {repository.permission}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
