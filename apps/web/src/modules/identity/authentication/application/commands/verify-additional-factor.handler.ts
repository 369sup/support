import type {
  VerifyAdditionalFactorCommand,
  VerifyAdditionalFactorResult,
  VerifyAdditionalFactorUseCase,
} from "../ports/inbound/verify-additional-factor.use-case";
import type { AccountSecurityService } from "../services/account-security.service";

export class VerifyAdditionalFactorHandler
  implements VerifyAdditionalFactorUseCase
{
  private readonly service: AccountSecurityService;

  constructor(service: AccountSecurityService) {
    this.service = service;
  }

  verifyAdditionalFactor(
    command: VerifyAdditionalFactorCommand,
  ): Promise<VerifyAdditionalFactorResult> {
    return this.service.verifyAdditionalFactor(command);
  }
}
