import type {
  EnterSudoModeCommand,
  EnterSudoModeResult,
  EnterSudoModeUseCase,
} from "../ports/inbound/enter-sudo-mode.use-case";
import type { AccountSecurityService } from "../services/account-security.service";

export class EnterSudoModeHandler implements EnterSudoModeUseCase {
  private readonly service: AccountSecurityService;

  constructor(service: AccountSecurityService) {
    this.service = service;
  }

  enterSudoMode(
    command: EnterSudoModeCommand,
  ): Promise<EnterSudoModeResult> {
    return this.service.enterSudoMode(command);
  }
}
