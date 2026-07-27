import { applyAccountIdentityTransaction } from "@/modules/identity/accounts/server-api";

import type {
  AccountIdentityGatewayPort,
  AccountIdentityStep,
  AccountIdentityStepResult,
} from "../../../application/ports/outbound/account-identity.gateway.port";

export class AccountIdentityAdapter implements AccountIdentityGatewayPort {
  apply(step: AccountIdentityStep): Promise<AccountIdentityStepResult> {
    return applyAccountIdentityTransaction(step);
  }
}
