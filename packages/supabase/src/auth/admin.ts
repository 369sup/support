import "server-only";

export {
  createSupabaseAuthAdminGateway,
  type SupabaseAuthAdminGateway,
  type SupabaseAuthAdminResult,
} from "./admin-gateway";
export {
  resolveSupabaseServerConfiguration,
  type SupabaseServerRuntimeConfiguration,
} from "../server-configuration";
