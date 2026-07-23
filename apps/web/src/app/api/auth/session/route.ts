import { NextResponse } from "next/server";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/modules/identity/authentication/server-api";
import { getCurrentAuthenticatedSession } from "@/modules/identity/authentication/server-api";

export async function GET(): Promise<Response> {
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
  const result = await getCurrentAuthenticatedSession(browserToken);
  return NextResponse.json(result, {
    status: result.status === "authenticated" ? 200 : 401,
  });
}
