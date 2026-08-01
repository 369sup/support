import type {
  AuthenticatedSessionReference,
  CurrentSessionResult,
} from "../../../contracts/authenticated-session-reference";
import { createRequiredCurrentSessionAdapter } from "./required-current-session.adapter";

interface CurrentSessionDependencies {
  readBrowserSessionToken: () => Promise<string | null>;
  getCurrentAuthenticatedSession: (
    browserToken: string,
  ) => Promise<CurrentSessionResult>;
}

export function createCurrentSessionAdapter({
  readBrowserSessionToken,
  getCurrentAuthenticatedSession,
}: CurrentSessionDependencies) {
  async function getOptionalCurrentSession(): Promise<AuthenticatedSessionReference | null> {
    const browserToken = await readBrowserSessionToken();
    if (browserToken === null) {
      return null;
    }
    const result = await getCurrentAuthenticatedSession(browserToken);
    return result.status === "authenticated" ? result.session : null;
  }

  return createRequiredCurrentSessionAdapter(getOptionalCurrentSession);
}
