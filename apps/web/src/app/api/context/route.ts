import { NextResponse } from "next/server";

import { getOptionalCurrentSession } from "@/modules/identity/authentication/server-api";
import { isInMemoryRuntimeEnabled } from "@/modules/identity/authentication/server-api";
import { restoreLastValidDashboardContext } from "@/modules/projections/dashboard/server-api";

export async function GET(): Promise<Response> {
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
  return NextResponse.json(
    await restoreLastValidDashboardContext(session),
  );
}
