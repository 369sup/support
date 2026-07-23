import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isInMemoryRuntimeEnabled,
  readBrowserSessionToken,
  writeBrowserSessionToken,
} from "@/app/_authentication/browser-session-cookie";
import { hasSameOrigin } from "@/app/_authentication/same-origin";
import { createDevelopmentSession } from "@/modules/identity/authentication/server-api";

const requestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
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
  const result = await createDevelopmentSession({
    browserToken: await readBrowserSessionToken(),
    ...parsed.data,
  });
  if (result.status !== "created") {
    return NextResponse.json(result, {
      status: result.status === "invalid-credentials" ? 401 : 403,
    });
  }

  await writeBrowserSessionToken(result.browserToken);
  return NextResponse.json(
    { status: "created", session: result.session },
    { status: 201 },
  );
}
