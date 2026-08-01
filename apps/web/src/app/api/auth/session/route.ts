import { NextResponse } from "next/server";

import { getCurrentAuthenticatedSession } from "@/modules/identity/authentication/server-api";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const result = await getCurrentAuthenticatedSession();
  return NextResponse.json(result, {
    status: result.status === "authenticated" ? 200 : 401,
    headers: { "Cache-Control": "private, no-store" },
  });
}
