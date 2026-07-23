import type {
  GetAccountReferenceByIdQuery,
  GetAccountReferenceByIdResult,
  GetAccountReferenceByIdUseCase,
} from "../ports/inbound/get-account-reference-by-id.use-case";
import type { AccountQueryRepositoryPort } from "../ports/outbound/account-query.repository.port";

export class GetAccountReferenceByIdHandler
  implements GetAccountReferenceByIdUseCase
{
  private readonly accountQueryRepository: AccountQueryRepositoryPort;

  constructor(
    accountQueryRepository: AccountQueryRepositoryPort,
  ) {
    this.accountQueryRepository = accountQueryRepository;
  }

  async getAccountReferenceById(
    query: GetAccountReferenceByIdQuery,
  ): Promise<GetAccountReferenceByIdResult> {
    const account = await this.accountQueryRepository.findById(query.accountId);

    if (account === null || account.lifecycleState !== "active") {
      return { status: "account-not-found" };
    }

    return { status: "found", account };
  }
}
