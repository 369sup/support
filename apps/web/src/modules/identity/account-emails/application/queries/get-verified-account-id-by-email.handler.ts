import type {
  GetVerifiedAccountIdByEmailQuery,
  GetVerifiedAccountIdByEmailResult,
  GetVerifiedAccountIdByEmailUseCase,
} from "../ports/inbound/get-verified-account-id-by-email.use-case";
import type { AccountEmailRepositoryPort } from "../ports/outbound/account-email.repository.port";

export class GetVerifiedAccountIdByEmailHandler
  implements GetVerifiedAccountIdByEmailUseCase
{
  private readonly repository: AccountEmailRepositoryPort;

  constructor(repository: AccountEmailRepositoryPort) {
    this.repository = repository;
  }

  async getVerifiedAccountIdByEmail(
    query: GetVerifiedAccountIdByEmailQuery,
  ): Promise<GetVerifiedAccountIdByEmailResult> {
    const email = await this.repository.findByAddress(
      query.email.trim().toLowerCase(),
    );
    return email === null || !email.isVerified
      ? { status: "email-not-found" }
      : { accountId: email.accountId, status: "found" };
  }
}
