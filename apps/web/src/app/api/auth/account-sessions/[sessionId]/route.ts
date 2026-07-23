import { NextResponse } from "next/server";

import {
  clearBrowserSessionToken,
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { removeAccountSession } from "@/modules/identity/authentication/server-api";
import { restoreLastValidDashboardContext } from "@/modules/projections/dashboard/server-api";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
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
  const { sessionId } = await context.params;
  const result = await removeAccountSession({ browserToken, sessionId });
  if (result.status !== "removed") {
    return NextResponse.json(result, {
      status: result.status === "session-not-found" ? 404 : 401,
    });
  }
  if (result.browserSessionEmpty) {
    await clearBrowserSessionToken();
  } else if (result.currentSession !== null) {
    await restoreLastValidDashboardContext(result.currentSession);
  }
  return NextResponse.json(result);
}
