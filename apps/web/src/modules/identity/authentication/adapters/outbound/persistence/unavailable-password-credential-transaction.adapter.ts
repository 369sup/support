import "server-only";

import type {
  PasswordCredentialTransactionCommand,
  PasswordCredentialTransactionRepositoryPort,
  PasswordCredentialTransactionResult,
} from "../../../application/ports/outbound/password-credential-transaction.repository.port";

export class UnavailablePasswordCredentialTransactionAdapter
  implements PasswordCredentialTransactionRepositoryPort
{
  apply(
    command: PasswordCredentialTransactionCommand,
  ): Promise<PasswordCredentialTransactionResult> {
    return Promise.resolve({
      status:
        command.action === "prepare-registration"
          ? "password-rejected"
          : "transaction-not-found",
    });
  }
}
