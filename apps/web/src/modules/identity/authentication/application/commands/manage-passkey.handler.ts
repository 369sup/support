import type {
  ManagePasskeyCommand,
  ManagePasskeyResult,
  ManagePasskeyUseCase,
} from "../ports/inbound/manage-passkey.use-case";
import type { AccountSecurityService } from "../services/account-security.service";

export class ManagePasskeyHandler implements ManagePasskeyUseCase {
  private readonly service: AccountSecurityService;

  constructor(service: AccountSecurityService) {
    this.service = service;
  }

  managePasskey(
    command: ManagePasskeyCommand,
  ): Promise<ManagePasskeyResult> {
    return this.service.managePasskey(command);
  }
}
