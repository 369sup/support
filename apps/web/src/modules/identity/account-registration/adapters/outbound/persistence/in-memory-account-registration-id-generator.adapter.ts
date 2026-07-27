import type { AccountRegistrationIdGeneratorPort } from "../../../application/ports/outbound/account-registration-id-generator.port";

declare global {
  var __supportAccountRegistrationSequenceV1: number | undefined;
}

export class InMemoryAccountRegistrationIdGeneratorAdapter
  implements AccountRegistrationIdGeneratorPort
{
  nextAccountId(): string {
    return `account_registered_${this.nextSequence()}`;
  }

  nextTransactionId(): string {
    return `account_identity_transaction_${this.nextSequence()}`;
  }

  private nextSequence(): number {
    globalThis.__supportAccountRegistrationSequenceV1 =
      (globalThis.__supportAccountRegistrationSequenceV1 ?? 0) + 1;
    return globalThis.__supportAccountRegistrationSequenceV1;
  }
}
