import type {
  AddAccountEmailCommand,
  AddAccountEmailResult,
  AddAccountEmailUseCase,
} from "../ports/inbound/add-account-email.use-case";
import type { AccountEmailService } from "../services/account-email.service";

export class AddAccountEmailHandler implements AddAccountEmailUseCase {
  private readonly service: AccountEmailService;

  constructor(service: AccountEmailService) {
    this.service = service;
  }

  addAccountEmail(
    command: AddAccountEmailCommand,
  ): Promise<AddAccountEmailResult> {
    return this.service.addAccountEmail(command);
  }
}
