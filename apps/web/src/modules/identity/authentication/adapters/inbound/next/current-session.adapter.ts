import { redirect } from "next/navigation";

import type {
  AuthenticatedSessionReference,
  CurrentSessionResult,
} from "../../../contracts/authenticated-session-reference";

interface CurrentSessionDependencies {
  isInMemoryRuntimeEnabled: () => boolean;
  readBrowserSessionToken: () => Promise<string | null>;
  getCurrentAuthenticatedSession: (
    browserToken: string,
  ) => Promise<CurrentSessionResult>;
}

export function createCurrentSessionAdapter({
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
  getCurrentAuthenticatedSession,
}: CurrentSessionDependencies) {
  async function getOptionalCurrentSession(): Promise<AuthenticatedSessionReference | null> {
    if (!isInMemoryRuntimeEnabled()) {
      return null;
    }
    const browserToken = await readBrowserSessionToken();
    if (browserToken === null) {
      return null;
    }
    const result = await getCurrentAuthenticatedSession(browserToken);
    return result.status === "authenticated" ? result.session : null;
  }

  async function requireCurrentSession(): Promise<AuthenticatedSessionReference> {
    const session = await getOptionalCurrentSession();
    if (session === null) {
      redirect("/login");
    }
    return session;
  }

  return {
    getOptionalCurrentSession,
    requireCurrentSession,
  };
}
