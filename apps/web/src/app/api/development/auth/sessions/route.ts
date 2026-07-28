import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isDevelopmentAuthenticationEnabled,
  readBrowserSessionToken,
  writeBrowserSessionToken,
} from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { createDevelopmentSession } from "@/modules/identity/authentication/server-api";

const requestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
  secondFactor: z
    .union([
      z.object({
        kind: z.literal("recovery-code"),
        code: z.string().min(1),
      }),
      z.object({
        kind: z.literal("totp"),
        token: z.string().regex(/^\d{6}$/),
      }),
    ])
    .optional(),
});

export async function POST(request: Request): Promise<Response> {
  if (!isDevelopmentAuthenticationEnabled()) {
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
    username: parsed.data.username,
    password: parsed.data.password,
    ...(parsed.data.secondFactor === undefined
      ? {}
      : { secondFactor: parsed.data.secondFactor }),
  });
  if (result.status !== "created") {
    return NextResponse.json(result, {
      status:
        result.status === "invalid-credentials" ||
        result.status === "invalid-additional-factor"
          ? 401
          : 403,
    });
  }

  await writeBrowserSessionToken(result.browserToken);
  return NextResponse.json(
    { status: "created", session: result.session },
    { status: 201 },
  );
}
