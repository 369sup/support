import type {
  ChangePersonalAccountUsernameCommand,
  ChangePersonalAccountUsernameResult,
  ChangePersonalAccountUsernameUseCase,
} from "../ports/inbound/change-personal-account-username.use-case";
import type { AccountRegistrationService } from "../services/account-registration.service";

export class ChangePersonalAccountUsernameHandler
  implements ChangePersonalAccountUsernameUseCase
{
  private readonly service: AccountRegistrationService;

  constructor(service: AccountRegistrationService) {
    this.service = service;
  }

  changePersonalAccountUsername(
    command: ChangePersonalAccountUsernameCommand,
  ): Promise<ChangePersonalAccountUsernameResult> {
    return this.service.changeUsername(command);
  }
}
