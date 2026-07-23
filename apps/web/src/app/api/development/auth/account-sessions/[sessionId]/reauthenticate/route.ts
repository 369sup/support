import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
} from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { reauthenticateSession } from "@/modules/identity/authentication/server-api";

const requestSchema = z.object({ password: z.string().min(1) });

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
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const browserToken = await readBrowserSessionToken();
  if (browserToken === null) {
    return NextResponse.json(
      { status: "browser-session-not-found" },
      { status: 401 },
    );
  }
  const result = await reauthenticateSession({
    browserToken,
    sessionId: (await context.params).sessionId,
    password: parsed.data.password,
  });
  let status = 403;
  if (result.status === "reauthenticated") {
    status = 200;
  } else if (result.status === "session-not-found") {
    status = 404;
  } else if (result.status === "invalid-credentials") {
    status = 401;
  }
  return NextResponse.json(result, {
    status,
  });
}
