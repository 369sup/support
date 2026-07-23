import { NextResponse } from "next/server";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { expireSession } from "@/modules/identity/authentication/server-api";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const browserToken = await readBrowserSessionToken();
  if (browserToken === null) {
    return NextResponse.json(
      { status: "browser-session-not-found" },
      { status: 401 },
    );
  }
  const result = await expireSession({
    browserToken,
    sessionId: (await context.params).sessionId,
  });
  let status = 401;
  if (result.status === "expired") {
    status = 200;
  } else if (result.status === "session-not-found") {
    status = 404;
  }
  return NextResponse.json(result, {
    status,
  });
}
