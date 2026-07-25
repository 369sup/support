import { AccountSessionManager } from "@/modules/identity/authentication/browser-ui";
import {
  listBrowserAccountSessions,
  readBrowserSessionToken,
  requireCurrentSession,
} from "@/modules/identity/authentication/server-api";
import type { BrowserAccountSessionView } from "@/modules/identity/authentication/contracts/authenticated-session-reference";

export default async function SessionsSettingsPage() {
  const session = await requireCurrentSession();
  const browserToken = await readBrowserSessionToken();
  const sessions = await listBrowserAccountSessionsFromCookie(browserToken);

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
          Signed in as @{session.account.username}. Manage browser sessions that can
          access this account workspace.
        </p>

        <AccountSessionManager sessions={sessions} />
      </section>
    </main>
  );
}

async function listBrowserAccountSessionsFromCookie(
  browserToken: string | null,
): Promise<readonly BrowserAccountSessionView[]> {
  if (browserToken === null) {
    return [];
  }

  const result = await listBrowserAccountSessions(browserToken);
  return result.status === "found" ? result.sessions : [];
}
