import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hasSameOrigin,
  isPasswordAuthenticationEnabled,
  signInWithPassword,
  signOutCurrentSession,
} from "@/modules/identity/authentication/server-api";

const requestSchema = z.object({
  password: z.string().min(1),
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
  const result = await signInWithPassword({
    identifier: parsed.data.username,
    password: parsed.data.password,
  });
  if (result.status !== "created") {
    return NextResponse.json(result, {
      status: result.status === "invalid-credentials" ? 401 : 503,
    });
  }
  return NextResponse.json(
    { session: result.session, status: "created" },
    {
      headers: { "Cache-Control": "private, no-store" },
      status: 201,
    },
  );
}

export async function DELETE(request: Request): Promise<Response> {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const didSignOut = await signOutCurrentSession();
  return didSignOut
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(
        { status: "service-unavailable" },
        { status: 503 },
      );
}
