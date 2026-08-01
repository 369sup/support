import { redirect } from "next/navigation";

import { readFormString } from "@/app/_route-contracts/read-form-string";
import { TotpEnrollmentManager } from "@/modules/identity/authentication/browser-ui";
import {
  getAuthenticatorAssuranceLevel,
  listMfaFactors,
  reauthenticate,
  requireCurrentSession,
  signOutAllSessions,
  signOutOtherSessions,
  unenrollMfa,
} from "@/modules/identity/authentication/server-api";

async function reauthenticateAction(): Promise<never> {
  "use server";

  await requireCurrentSession();
  const result = await reauthenticate();
  redirect(`/settings/sessions?reauth=${result.status}`);
}

async function signOutAllAction(): Promise<never> {
  "use server";

  await requireCurrentSession();
  await signOutAllSessions();
  redirect("/login");
}

async function signOutOthersAction(): Promise<never> {
  "use server";

  await requireCurrentSession();
  const didSignOut = await signOutOtherSessions();
  redirect(
    `/settings/sessions?sessions=${didSignOut ? "other-sessions-signed-out" : "service-unavailable"}`,
  );
}

async function unenrollMfaAction(formData: FormData): Promise<never> {
  "use server";

  await requireCurrentSession();
  const result = await unenrollMfa(readFormString(formData, "factorId"));
  redirect(`/settings/sessions?mfa=${result.status}`);
}

export default async function SessionsSettingsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    mfa?: string;
    reauth?: string;
    sessions?: string;
  }>;
}>) {
  const session = await requireCurrentSession();
  const [assurance, factorsResult, query] = await Promise.all([
    getAuthenticatorAssuranceLevel(),
    listMfaFactors(),
    searchParams,
  ]);
  const factors =
    factorsResult.status === "found" ? factorsResult.factors : [];

  return (
    <main className="flex flex-1 px-4 py-10 sm:px-8">
      <section className="mx-auto w-full max-w-4xl">
        <p className="text-sm font-medium text-muted-foreground">
          Account-level security
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">
          Account sessions
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Signed in as @{session.account.username}. Supabase Auth is the only
          authority for this session and its authentication assurance level.
        </p>

        {query.sessions === undefined &&
        query.reauth === undefined &&
        query.mfa === undefined ? null : (
          <p
            className="mt-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
            role="status"
          >
            {query.sessions ?? query.reauth ?? query.mfa}
          </p>
        )}

        <section className="mt-8 rounded-xl border border-white/10 bg-[#0a1624] p-5">
          <h2 className="text-lg font-semibold text-white">Current session</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Session ID</dt>
              <dd className="mt-1 break-all font-mono text-slate-200">
                {session.sessionId}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Authentication assurance</dt>
              <dd className="mt-1 text-slate-200">
                {assurance.status === "found"
                  ? `${assurance.currentLevel ?? "unknown"} → ${assurance.nextLevel ?? "unknown"}`
                  : "Unavailable"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Authenticated</dt>
              <dd className="mt-1 text-slate-200">
                {session.authenticatedAt}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Expires</dt>
              <dd className="mt-1 text-slate-200">
                {session.expiresAt ?? "Managed by Supabase"}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <form action={reauthenticateAction}>
              <button
                className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
                type="submit"
              >
                Request reauthentication
              </button>
            </form>
            <form action={signOutOthersAction}>
              <button
                className="rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
                type="submit"
              >
                Sign out other sessions
              </button>
            </form>
            <form action={signOutAllAction}>
              <button
                className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-400/10"
                type="submit"
              >
                Sign out all sessions
              </button>
            </form>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-[#0a1624] p-5">
          <h2 className="text-lg font-semibold text-white">
            Authenticator application
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            TOTP factors are enrolled, challenged, verified, and removed by
            Supabase Auth. Support does not store recovery codes or a parallel
            MFA secret.
          </p>
          <TotpEnrollmentManager />
          {factorsResult.status !== "found" ? (
            <p className="mt-4 text-sm text-amber-200">
              Supabase MFA factors are temporarily unavailable.
            </p>
          ) : null}
          {factorsResult.status === "found" && factors.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No authenticator factor is enrolled.
            </p>
          ) : null}
          {factorsResult.status === "found" && factors.length > 0 ? (
            <ul className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10">
              {factors.map((factor) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                  key={factor.factorId}
                >
                  <div>
                    <p className="font-medium text-slate-100">
                      {factor.friendlyName ?? "Authenticator app"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {factor.status} · added {factor.createdAt}
                    </p>
                  </div>
                  <form action={unenrollMfaAction}>
                    <input
                      name="factorId"
                      type="hidden"
                      value={factor.factorId}
                    />
                    <button
                      className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-400/10"
                      type="submit"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
}
