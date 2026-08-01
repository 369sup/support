import { createClient } from "@supabase/supabase-js";

import {
  resolveSupabaseServerConfiguration,
  type SupabaseServerRuntimeConfiguration,
} from "../server-configuration";

type SupabaseAuthAdminFailure = Readonly<{
  code: string;
  status: number | null;
}>;

export type SupabaseAuthAdminResult =
  | Readonly<{ data: null; error: null }>
  | Readonly<{ data: null; error: SupabaseAuthAdminFailure }>;

export interface SupabaseAuthAdminGateway {
  deleteUser: (
    supabaseUserId: string,
  ) => Promise<SupabaseAuthAdminResult>;
}

export function createSupabaseAuthAdminGateway(
  configurationInput: SupabaseServerRuntimeConfiguration,
): SupabaseAuthAdminGateway {
  const configuration =
    resolveSupabaseServerConfiguration(configurationInput);
  const client = createClient(
    configuration.url,
    configuration.secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return {
    deleteUser: async (supabaseUserId) => {
      const normalizedUserId = supabaseUserId.trim();
      if (normalizedUserId === "") {
        return {
          data: null,
          error: { code: "invalid-user-id", status: null },
        };
      }
      try {
        const { error } =
          await client.auth.admin.deleteUser(normalizedUserId);
        if (error === null) {
          return { data: null, error: null };
        }
        return {
          data: null,
          error: {
            code:
              typeof error.code === "string" &&
              error.code.trim() !== ""
                ? error.code
                : "delete-user-failed",
            status:
              typeof error.status === "number" &&
              Number.isFinite(error.status)
                ? error.status
                : null,
          },
        };
      } catch {
        return {
          data: null,
          error: { code: "auth-service-unavailable", status: null },
        };
      }
    },
  };
}
