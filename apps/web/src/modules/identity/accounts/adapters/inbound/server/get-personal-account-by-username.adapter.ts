import type { GetPersonalAccountByUsernameUseCase } from "../../../application/ports/inbound/get-personal-account-by-username.use-case";
import type { PersonalAccountLookupResult } from "../../../contracts/user-owner-reference";

export type GetPersonalAccountByUsernameAdapter = (
  username: string,
) => Promise<PersonalAccountLookupResult>;

export function createGetPersonalAccountByUsernameAdapter(
  useCase: GetPersonalAccountByUsernameUseCase,
): GetPersonalAccountByUsernameAdapter {
  return async function getPersonalAccountByUsername(
    username: string,
  ): Promise<PersonalAccountLookupResult> {
    const result = await useCase.getPersonalAccountByUsername({ username });

    if (result.status !== "found") {
      return { isSuccessful: false, error: result.status };
    }

    return {
      isSuccessful: true,
      account: {
        accountId: result.account.accountId,
        username: result.account.username,
      },
    };
  };
}
