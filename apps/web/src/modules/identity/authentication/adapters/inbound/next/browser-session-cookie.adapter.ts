import "server-only";

import { cookies } from "next/headers";

const browserSessionCookieName = "support.browser-session";

export const browserSessionCookie = {
  isInMemoryRuntimeEnabled: () => {
    return (
      process.env.NODE_ENV === "development" ||
      process.env["SUPPORT_IN_MEMORY_RUNTIME"] === "enabled"
    );
  },

  read: async () => {
    return (await cookies()).get(browserSessionCookieName)?.value ?? null;
  },

  write: async (browserToken: string) => {
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
  },

  clear: async () => {
    (await cookies()).delete(browserSessionCookieName);
  },
};
