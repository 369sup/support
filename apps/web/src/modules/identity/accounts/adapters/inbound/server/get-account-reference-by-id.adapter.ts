import type { GetAccountReferenceByIdUseCase } from "../../../application/ports/inbound/get-account-reference-by-id.use-case";
import type { AccountReferenceLookupResult } from "../../../contracts/account-reference";

export type GetAccountReferenceByIdAdapter = (
  accountId: string,
) => Promise<AccountReferenceLookupResult>;

export function createGetAccountReferenceByIdAdapter(
  useCase: GetAccountReferenceByIdUseCase,
): GetAccountReferenceByIdAdapter {
  return async function getAccountReferenceById(accountId) {
    const result = await useCase.getAccountReferenceById({ accountId });
    if (result.status !== "found") {
      return result;
    }
    return {
      status: "found",
      account: {
        ...result.account,
        lifecycleState: "active",
      },
    };
  };
}
