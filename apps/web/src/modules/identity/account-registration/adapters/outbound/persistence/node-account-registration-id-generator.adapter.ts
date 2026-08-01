import "server-only";

import { randomUUID } from "node:crypto";

import type { AccountRegistrationIdGeneratorPort } from "../../../application/ports/outbound/account-registration-id-generator.port";

export class NodeAccountRegistrationIdGeneratorAdapter
  implements AccountRegistrationIdGeneratorPort
{
  nextAccountId(): string {
    return `account_${randomUUID()}`;
  }

  nextTransactionId(): string {
    return `account_identity_transaction_${randomUUID()}`;
  }
}
