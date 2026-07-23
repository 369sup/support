import { NextResponse } from "next/server";

import { isInMemoryRuntimeEnabled } from "@/app/_authentication/browser-session-cookie";
import { getOptionalCurrentSession } from "@/app/_authentication/current-session";
import { getDashboardRepositoryView } from "@/modules/projections/dashboard/server-api";

export async function GET() {
  if (!isInMemoryRuntimeEnabled()) {
    return new NextResponse(null, { status: 404 });
  }
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return NextResponse.json(
      { status: "authentication-required" },
      { status: 401 },
    );
  }
  return NextResponse.json(await getDashboardRepositoryView(session));
}
