import { cookies } from "next/headers";

export const browserSessionCookieName = "support.browser-session";

export function isInMemoryRuntimeEnabled() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env["SUPPORT_IN_MEMORY_RUNTIME"] === "enabled"
  );
}

export async function readBrowserSessionToken() {
  return (await cookies()).get(browserSessionCookieName)?.value ?? null;
}

export async function writeBrowserSessionToken(browserToken: string) {
  (await cookies()).set({
    name: browserSessionCookieName,
    value: browserToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure:
      process.env.NODE_ENV === "production" &&
      process.env["SUPPORT_IN_MEMORY_RUNTIME"] !== "enabled",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearBrowserSessionToken() {
  (await cookies()).delete(browserSessionCookieName);
}
