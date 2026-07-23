import { NextResponse } from "next/server";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { switchActiveAccountSession } from "@/modules/identity/authentication/server-api";
import { restoreLastValidDashboardContext } from "@/modules/projections/dashboard/server-api";

export async function POST(
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
  const result = await switchActiveAccountSession({
    browserToken,
    sessionId,
  });
  if (result.status !== "switched") {
    let status = 401;
    if (result.status === "reauthentication-required") {
      status = 409;
    } else if (result.status === "session-not-found") {
      status = 404;
    }
    return NextResponse.json(result, {
      status,
    });
  }
  const dashboardContext = await restoreLastValidDashboardContext(
    result.session,
  );
  return NextResponse.json({
    status: "switched",
    session: result.session,
    dashboardContext,
  });
}
