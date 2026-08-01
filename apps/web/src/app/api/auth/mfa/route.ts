import { NextResponse } from "next/server";
import { z } from "zod";

import {
  challengeMfa,
  enrollTotp,
  hasSameOrigin,
  requireCurrentSession,
  verifyMfa,
} from "@/modules/identity/authentication/server-api";

const requestSchema = z.discriminatedUnion("operation", [
  z.object({
    friendlyName: z.string().trim().min(1).max(64),
    operation: z.literal("enroll"),
  }),
  z.object({
    factorId: z.string().trim().min(1),
    operation: z.literal("challenge"),
  }),
  z.object({
    challengeId: z.string().trim().min(1),
    code: z.string().regex(/^[0-9]{6}$/u),
    factorId: z.string().trim().min(1),
    operation: z.literal("verify"),
  }),
]);

export async function POST(request: Request): Promise<Response> {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ status: "invalid-origin" }, { status: 403 });
  }
  await requireCurrentSession();
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { status: "invalid-request" },
      { status: 400 },
    );
  }

  let result;
  if (parsed.data.operation === "enroll") {
    result = await enrollTotp(parsed.data.friendlyName);
  } else if (parsed.data.operation === "challenge") {
    result = await challengeMfa(parsed.data.factorId);
  } else {
    result = await verifyMfa(parsed.data);
  }
  const isSuccess =
    result.status === "enrolled" ||
    result.status === "challenged" ||
    result.status === "updated";
  let status = 400;
  if (isSuccess) {
    status = 200;
  } else if (result.status === "service-unavailable") {
    status = 503;
  }
  return NextResponse.json(result, {
    headers: { "Cache-Control": "private, no-store" },
    status,
  });
}
