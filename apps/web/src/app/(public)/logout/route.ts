import { NextResponse } from "next/server";

import {
  clearBrowserSessionToken,
  readBrowserSessionToken,
  signOutAllSessions,
} from "@/modules/identity/authentication/server-api";

export async function GET(request: Request): Promise<Response> {
  const browserToken = await readBrowserSessionToken();
  if (browserToken !== null) {
    await signOutAllSessions(browserToken);
    await clearBrowserSessionToken();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
