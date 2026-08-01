import "server-only";

import {
  createSupabaseAuthGateway,
  type SupabaseAuthGateway,
} from "@support/supabase/auth";
import { cookies } from "next/headers";

import { resolveWebAuthenticationConfiguration } from "../../../../../../../supabase-auth-configuration";

export async function createSupabaseServerAuthGateway(): Promise<SupabaseAuthGateway> {
  const configuration = resolveWebAuthenticationConfiguration();
  const cookieStore = await cookies();
  return createSupabaseAuthGateway({
    configuration: configuration.supabase,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet, headers) => {
        void headers;
        try {
          for (const { name, options, value } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Proxy refreshes them.
        }
      },
    },
  });
}
