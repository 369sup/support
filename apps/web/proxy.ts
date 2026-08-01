import { createSupabaseAuthGateway } from "@support/supabase/auth";
import { type NextRequest, NextResponse } from "next/server";

import { resolveWebAuthenticationConfiguration } from "./supabase-auth-configuration";

export async function proxy(request: NextRequest) {
  const configuration = resolveWebAuthenticationConfiguration();
  if (configuration.provider !== "supabase") {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createSupabaseAuthGateway({
    configuration: configuration.supabase,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, options, value } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  await supabase.refreshSession();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
