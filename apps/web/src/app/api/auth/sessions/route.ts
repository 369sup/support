import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createPasswordSession,
  hasSameOrigin,
  isPasswordAuthenticationEnabled,
  readBrowserSessionToken,
  writeBrowserSessionToken,
} from "@/modules/identity/authentication/server-api";

const requestSchema = z.object({
  password: z.string().min(1),
  secondFactor: z
    .union([
      z.object({
        code: z.string().min(1),
        kind: z.literal("recovery-code"),
      }),
      z.object({
        kind: z.literal("totp"),
        token: z.string().regex(/^\d{6}$/),
      }),
    ])
    .optional(),
  username: z.string().trim().min(1),
});

export async function POST(request: Request): Promise<Response> {
  if (!isPasswordAuthenticationEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid-request" },
      { status: 400 },
    );
  }
  const result = await createPasswordSession({
    browserToken: await readBrowserSessionToken(),
    password: parsed.data.password,
    ...(parsed.data.secondFactor === undefined
      ? {}
      : { secondFactor: parsed.data.secondFactor }),
    username: parsed.data.username,
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
    { session: result.session, status: "created" },
    { status: 201 },
  );
}
