import type { AuthenticationAccountSnapshot } from "./ports/outbound/account-reference.gateway.port";
import type { AccountSessionSnapshot } from "./ports/outbound/browser-session-set.repository.port";

export type ResolvedAccountSessionSnapshot = AccountSessionSnapshot &
  Readonly<{ account: AuthenticationAccountSnapshot }>;
