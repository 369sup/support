import { NextResponse } from "next/server";
import { z } from "zod";

import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { hasSameOrigin } from "@/modules/identity/authentication/server-api";
import { selectDashboardContext } from "@/modules/projections/dashboard/server-api";

const requestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("personal"), id: z.string().min(1) }),
  z.object({ kind: z.literal("organization"), id: z.string().min(1) }),
]);

export async function POST(request: Request): Promise<Response> {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return NextResponse.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid-request" }, { status: 400 });
  }
  const result = await selectDashboardContext(session, parsed.data);
  let status = 404;
  if (result.status === "selected") {
    status = 200;
  } else if (result.status === "cross-account-context") {
    status = 403;
  }
  return NextResponse.json(result, {
    status,
  });
}
