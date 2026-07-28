import type {
  UpdateAccountEmailSettingsCommand,
  UpdateAccountEmailSettingsResult,
  UpdateAccountEmailSettingsUseCase,
} from "../ports/inbound/update-account-email-settings.use-case";
import type { AccountEmailService } from "../services/account-email.service";

export class UpdateAccountEmailSettingsHandler
  implements UpdateAccountEmailSettingsUseCase
{
  private readonly service: AccountEmailService;

  constructor(service: AccountEmailService) {
    this.service = service;
  }

  updateAccountEmailSettings(
    command: UpdateAccountEmailSettingsCommand,
  ): Promise<UpdateAccountEmailSettingsResult> {
    return this.service.updateAccountEmailSettings(command);
  }
}
