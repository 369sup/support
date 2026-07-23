import type { PersonalAccountLookupResult } from "../../../contracts/user-owner-reference";
import { personalAccountQueryRuntime } from "./personal-account-query-runtime.adapter";

export async function getPersonalAccountByUsername(
  username: string,
): Promise<PersonalAccountLookupResult> {
  const normalizedUsername = username.trim();

  if (normalizedUsername.length === 0) {
    return { ok: false, error: "invalid-username" };
  }

  const result = await personalAccountQueryRuntime
    .getPersonalAccountByUsernameUseCase()
    .getPersonalAccountByUsername({ username: normalizedUsername });

  if (result.status === "not-found") {
    return { ok: false, error: "account-not-found" };
  }

  return {
    ok: true,
    account: {
      accountId: result.account.accountId,
      username: result.account.username,
    },
  };
}
