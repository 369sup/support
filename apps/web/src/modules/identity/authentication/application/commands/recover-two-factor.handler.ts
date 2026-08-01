import type {
  RecoverTwoFactorCommand,
  RecoverTwoFactorResult,
  RecoverTwoFactorUseCase,
} from "../ports/inbound/recover-two-factor.use-case";
import type { AccountSecurityService } from "../services/account-security.service";

export class RecoverTwoFactorHandler implements RecoverTwoFactorUseCase {
  private readonly service: AccountSecurityService;

  constructor(service: AccountSecurityService) {
    this.service = service;
  }

  recoverTwoFactor(
    command: RecoverTwoFactorCommand,
  ): Promise<RecoverTwoFactorResult> {
    return this.service.recoverTwoFactor(command);
  }
}
