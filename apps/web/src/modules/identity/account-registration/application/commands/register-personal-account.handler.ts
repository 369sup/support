import type {
  RegisterPersonalAccountCommand,
  RegisterPersonalAccountResult,
  RegisterPersonalAccountUseCase,
} from "../ports/inbound/register-personal-account.use-case";
import type { AccountRegistrationService } from "../services/account-registration.service";

export class RegisterPersonalAccountHandler
  implements RegisterPersonalAccountUseCase
{
  private readonly service: AccountRegistrationService;

  constructor(service: AccountRegistrationService) {
    this.service = service;
  }

  registerPersonalAccount(
    command: RegisterPersonalAccountCommand,
  ): Promise<RegisterPersonalAccountResult> {
    return this.service.register(command);
  }
}
