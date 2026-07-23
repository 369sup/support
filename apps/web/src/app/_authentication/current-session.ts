import { redirect } from "next/navigation";

import {
  getCurrentAuthenticatedSession,
  type AuthenticatedSessionReference,
} from "@/modules/identity/authentication/server-api";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "./browser-session-cookie";

export async function getOptionalCurrentSession(): Promise<AuthenticatedSessionReference | null> {
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

export async function requireCurrentSession(): Promise<AuthenticatedSessionReference> {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    redirect("/sign-in");
  }
  return session;
}
