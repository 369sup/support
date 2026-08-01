import { NextResponse } from "next/server";

import {
  signOutCurrentSession,
} from "@/modules/identity/authentication/server-api";

export async function GET(request: Request): Promise<Response> {
  await signOutCurrentSession();
  return NextResponse.redirect(new URL("/login", request.url));
}
