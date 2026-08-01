import type { GetAccountReferenceByIdUseCase } from "../../../application/ports/inbound/get-account-reference-by-id.use-case";
import type { AccountReferenceLookupResult } from "../../../contracts/account-reference";

export type GetAccountReferenceByIdAdapter = (
  accountId: string,
) => Promise<AccountReferenceLookupResult>;

export function createGetAccountReferenceByIdAdapter(
  useCase: GetAccountReferenceByIdUseCase,
): GetAccountReferenceByIdAdapter {
  return async function getAccountReferenceById(accountId) {
    return useCase.getAccountReferenceById({ accountId });
  };
}
