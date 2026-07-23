import { NextResponse } from "next/server";

import {
  clearBrowserSessionToken,
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import {
  listBrowserAccountSessions,
  signOutAllSessions,
} from "@/modules/identity/authentication/server-api";

export async function GET() {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  const browserToken = await readBrowserSessionToken();
  if (browserToken === null) {
    return NextResponse.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }
  const result = await listBrowserAccountSessions(browserToken);
  return NextResponse.json(result, {
    status: result.status === "found" ? 200 : 401,
  });
}

export async function DELETE(request: Request) {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const browserToken = await readBrowserSessionToken();
  if (browserToken !== null) {
    await signOutAllSessions(browserToken);
  }
  await clearBrowserSessionToken();
  return new NextResponse(null, { status: 204 });
}
