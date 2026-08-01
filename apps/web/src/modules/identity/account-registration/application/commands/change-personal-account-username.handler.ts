import type {
  ChangePersonalAccountUsernameCommand,
  ChangePersonalAccountUsernameResult,
  ChangePersonalAccountUsernameUseCase,
} from "../ports/inbound/change-personal-account-username.use-case";
import type { PersonalAccountUsernameService } from "../services/personal-account-username.service";

export class ChangePersonalAccountUsernameHandler
  implements ChangePersonalAccountUsernameUseCase
{
  private readonly service: PersonalAccountUsernameService;

  constructor(service: PersonalAccountUsernameService) {
    this.service = service;
  }

  changePersonalAccountUsername(
    command: ChangePersonalAccountUsernameCommand,
  ): Promise<ChangePersonalAccountUsernameResult> {
    return this.service.changeUsername(command);
  }
}
