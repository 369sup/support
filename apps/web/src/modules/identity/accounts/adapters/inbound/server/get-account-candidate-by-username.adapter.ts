import type { GetAccountCandidateByUsernameUseCase } from "../../../application/ports/inbound/get-account-candidate-by-username.use-case";
import type { AccountReferenceLookupResult } from "../../../contracts/account-reference";

export type GetAccountCandidateByUsernameAdapter = (
  username: string,
) => Promise<AccountReferenceLookupResult>;

export function createGetAccountCandidateByUsernameAdapter(
  useCase: GetAccountCandidateByUsernameUseCase,
): GetAccountCandidateByUsernameAdapter {
  return async function getAccountCandidateByUsername(
    username,
  ): Promise<AccountReferenceLookupResult> {
    const result = await useCase.getAccountCandidateByUsername({ username });
    if (result.status !== "found") {
      return { status: "account-not-found" };
    }

    return { status: "found", account: result.account };
  };
}
