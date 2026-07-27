import type {
  ApplyPasswordCredentialTransactionCommand,
  ApplyPasswordCredentialTransactionResult,
  ApplyPasswordCredentialTransactionUseCase,
} from "../ports/inbound/apply-password-credential-transaction.use-case";
import type { PasswordCredentialTransactionRepositoryPort } from "../ports/outbound/password-credential-transaction.repository.port";

export class ApplyPasswordCredentialTransactionHandler
  implements ApplyPasswordCredentialTransactionUseCase
{
  private readonly repository: PasswordCredentialTransactionRepositoryPort;

  constructor(repository: PasswordCredentialTransactionRepositoryPort) {
    this.repository = repository;
  }

  applyPasswordCredentialTransaction(
    command: ApplyPasswordCredentialTransactionCommand,
  ): Promise<ApplyPasswordCredentialTransactionResult> {
    return this.repository.apply(command);
  }
}
