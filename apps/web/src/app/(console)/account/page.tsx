import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { changePersonalAccountUsername } from "@/modules/identity/account-registration/server-api";
import { deletePersonalAccount } from "@/modules/identity/accounts/server-api";
import {
  requireCurrentSession,
  signOutAllSessions,
} from "@/modules/identity/authentication/server-api";
import {
  getUserProfile,
  updateUserProfile,
} from "@/modules/identity/profiles/server-api";

async function updateProfileAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const result = await updateUserProfile({
    actorAccountId: session.account.accountId,
    accountId: session.account.accountId,
    displayName: readFormString(formData, "displayName"),
    bio: readFormString(formData, "bio"),
    location: readFormString(formData, "location"),
    pronouns: readFormString(formData, "pronouns"),
    visibility: formData.get("visibility") === "private" ? "private" : "public",
    status: null,
  });

  if (result.status !== "updated") {
    redirect(`/account?profile=${result.status}`);
  }

  revalidatePath("/account");
  revalidatePath(`/${session.account.username}`);
  redirect("/account?profile=updated");
}

async function deleteAccountAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  const confirmation = readFormString(formData, "confirmation").trim();
  if (confirmation !== session.account.username) {
    redirect("/account?account=confirmation-required");
  }

  const result = await deletePersonalAccount({
    actorAccountId: session.account.accountId,
    accountId: session.account.accountId,
    supabaseUserId: session.supabaseUserId,
  });
  if (result.status !== "deleted") {
    redirect(`/account?account=${result.status}`);
  }

  await signOutAllSessions();
  redirect("/login");
}

async function changeUsernameAction(formData: FormData): Promise<never> {
  "use server";

  const session = await requireCurrentSession();
  if (
    readFormString(formData, "confirmation").trim() !==
    session.account.username
  ) {
    redirect("/account?account=username-confirmation-required");
  }
  const result = await changePersonalAccountUsername({
    actorAccountId: session.account.accountId,
    accountId: session.account.accountId,
    newUsername: readFormString(formData, "newUsername"),
  });
  if (result.status === "changed") {
    revalidatePath("/account");
    revalidatePath(`/${session.account.username}`);
    revalidatePath(`/${result.account.username}`);
  }
  redirect(`/account?account=${result.status}`);
}

export default async function AccountPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ account?: string; profile?: string }>;
}>) {
  const session = await requireCurrentSession();
  const [profileResult, query] = await Promise.all([
    getUserProfile({
      accountId: session.account.accountId,
      isOwner: true,
    }),
    searchParams,
  ]);
  const profile =
    profileResult.status === "found" ? profileResult.profile : null;

  return (
    <main className="flex flex-1 px-5 py-12 sm:px-8">
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-white/10 bg-[#0a1624] p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-400 uppercase">
            Authenticated account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            @{session.account.username}
          </h1>
          <dl className="mt-7 grid gap-5 text-sm">
            <div>
              <dt className="text-slate-500">Account ID</dt>
              <dd className="mt-1 break-all font-mono text-slate-200">
                {session.account.accountId}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Type</dt>
              <dd className="mt-1 capitalize text-slate-200">
                {session.account.accountType} · {session.account.usage}
              </dd>
            </div>
          </dl>
        </aside>

        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.035em]">
            Public profile
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Profile details are stored durably in the Support database.
          </p>

          {query.profile === "updated" ? (
            <p
              className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
              role="status"
            >
              Profile updated.
            </p>
          ) : null}

          {profile === null ? (
            <p
              className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100"
              role="status"
            >
              No editable development profile exists for this account.
            </p>
          ) : (
            <form action={updateProfileAction} className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                Display name
                <input
                  className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                  defaultValue={profile.displayName}
                  name="displayName"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                Bio
                <textarea
                  className="min-h-28 resize-y rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                  defaultValue={profile.bio}
                  maxLength={160}
                  name="bio"
                />
                <span className="text-xs font-normal text-slate-500">
                  Up to 160 characters.
                </span>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  Location
                  <input
                    className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    defaultValue={profile.location}
                    name="location"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  Pronouns
                  <input
                    className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    defaultValue={profile.pronouns}
                    name="pronouns"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-200">
                Profile visibility
                <select
                  className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                  defaultValue={profile.visibility}
                  name="visibility"
                >
                  <option value="public">Public</option>
                  <option value="private">Private social details</option>
                </select>
              </label>
              <button
                className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                type="submit"
              >
                Update profile
              </button>
            </form>
          )}

          <section className="mt-12 border-t border-border pt-8">
            <h2 className="text-xl font-semibold">Change username</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              The public account namespace changes without replacing the
              stable Support account or Supabase Auth identity.
            </p>
            {query.account === "changed" ? (
              <p
                className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
                role="status"
              >
                Username changed successfully.
              </p>
            ) : null}
            {query.account !== undefined &&
            query.account !== "changed" &&
            query.account !== "confirmation-required" ? (
              <p
                className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
                role="alert"
              >
                {usernameChangeMessage(query.account)}
              </p>
            ) : null}
            {session.account.accountType === "personal" &&
            session.account.usage === "human" ? (
              <form action={changeUsernameAction} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  New username
                  <input
                    className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    maxLength={39}
                    name="newUsername"
                    pattern="[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  Type your current username to confirm
                  <input
                    className="rounded-lg border border-white/15 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                    name="confirmation"
                    placeholder={session.account.username}
                    required
                  />
                </label>
                <button
                  className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
                  type="submit"
                >
                  Change username
                </button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Managed usernames are controlled by enterprise provisioning.
              </p>
            )}
          </section>

          <section className="mt-12 border-t border-red-400/20 pt-8">
            <h2 className="text-xl font-semibold text-red-200">Danger zone</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Deleting a personal account is permanent after the ownership
              prerequisites pass. Every Supabase Auth session is signed out.
            </p>
            {query.account === "confirmation-required" ? (
              <p
                className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100"
                role="alert"
              >
                Enter your username exactly to confirm deletion.
              </p>
            ) : null}
            <form action={deleteAccountAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="delete-confirmation">
                Username confirmation
              </label>
              <input
                className="min-w-0 flex-1 rounded-lg border border-red-400/30 bg-[#08111d] px-3 py-2.5 text-white outline-none focus:border-red-300"
                id="delete-confirmation"
                name="confirmation"
                placeholder={session.account.username}
              />
              <button
                className="rounded-lg border border-red-400/40 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-400/10"
                type="submit"
              >
                Delete personal account
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}

function usernameChangeMessage(status: string): string {
  const messages: Readonly<Record<string, string>> = {
    "account-not-found": "The account is no longer available.",
    "credential-unavailable":
      "The account has no password credential that can be renamed.",
    "invalid-username":
      "Use 1–39 letters, numbers, or single hyphens; do not begin or end with a hyphen.",
    "permission-denied": "You can change only your own username.",
    "transaction-failed":
      "The transaction failed and both account and credential were restored.",
    "unsupported-account-type":
      "Managed and machine-use accounts cannot use this personal account flow.",
    "username-confirmation-required":
      "Type your current username exactly to confirm.",
    "username-conflict": "That username is already in use.",
  };
  return messages[status] ?? "The username could not be changed.";
}
