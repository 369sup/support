import type {
  VerifyAccountEmailCommand,
  VerifyAccountEmailResult,
  VerifyAccountEmailUseCase,
} from "../ports/inbound/verify-account-email.use-case";
import type { AccountEmailService } from "../services/account-email.service";

export class VerifyAccountEmailHandler
  implements VerifyAccountEmailUseCase
{
  private readonly service: AccountEmailService;

  constructor(service: AccountEmailService) {
    this.service = service;
  }

  verifyAccountEmail(
    command: VerifyAccountEmailCommand,
  ): Promise<VerifyAccountEmailResult> {
    return this.service.verifyAccountEmail(command);
  }
}
