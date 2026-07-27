import { applyPasswordCredentialTransaction } from "@/modules/identity/authentication/server-api";

import type {
  PasswordCredentialGatewayPort,
  PasswordCredentialStep,
  PasswordCredentialStepResult,
} from "../../../application/ports/outbound/password-credential.gateway.port";

export class PasswordCredentialAdapter
  implements PasswordCredentialGatewayPort
{
  apply(
    step: PasswordCredentialStep,
  ): Promise<PasswordCredentialStepResult> {
    return applyPasswordCredentialTransaction(step);
  }
}
