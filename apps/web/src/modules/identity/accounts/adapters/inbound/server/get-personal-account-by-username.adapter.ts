import type { PersonalAccountLookupResult } from "../../../contracts/user-owner-reference";
import { personalAccountQueryRuntime } from "./personal-account-query-runtime.adapter";

export async function getPersonalAccountByUsername(
  username: string,
): Promise<PersonalAccountLookupResult> {
  const result = await personalAccountQueryRuntime
    .getPersonalAccountByUsernameUseCase()
    .getPersonalAccountByUsername({ username });

  if (result.status !== "found") {
    return { ok: false, error: result.status };
  }

  return {
    ok: true,
    account: {
      accountId: result.account.accountId,
      username: result.account.username,
    },
  };
}
