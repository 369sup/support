import type {
  ApplyAccountIdentityTransactionCommand,
  ApplyAccountIdentityTransactionResult,
  ApplyAccountIdentityTransactionUseCase,
} from "../ports/inbound/apply-account-identity-transaction.use-case";
import type { AccountIdentityTransactionRepositoryPort } from "../ports/outbound/account-identity-transaction.repository.port";

export class ApplyAccountIdentityTransactionHandler
  implements ApplyAccountIdentityTransactionUseCase
{
  private readonly repository: AccountIdentityTransactionRepositoryPort;

  constructor(repository: AccountIdentityTransactionRepositoryPort) {
    this.repository = repository;
  }

  applyAccountIdentityTransaction(
    command: ApplyAccountIdentityTransactionCommand,
  ): Promise<ApplyAccountIdentityTransactionResult> {
    return this.repository.apply(command);
  }
}
