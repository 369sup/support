import { NextResponse } from "next/server";

import { getPersonalAccountByUsername } from "@/modules/identity/accounts/server-api";
import { listActivePublicRepositoriesForPersonalOwner } from "@/modules/repositories/repositories/server-api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const account = await getPersonalAccountByUsername(
    (await context.params).username,
  );
  if (!account.ok) {
    return NextResponse.json(
      { status: account.error },
      { status: account.error === "invalid-username" ? 400 : 404 },
    );
  }
  return NextResponse.json({
    status: "found",
    repositories:
      await listActivePublicRepositoriesForPersonalOwner(account.account),
  });
}
