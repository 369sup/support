import type {
  ConfigureTotpCommand,
  ConfigureTotpResult,
  ConfigureTotpUseCase,
} from "../ports/inbound/configure-totp.use-case";
import type { AccountSecurityService } from "../services/account-security.service";

export class ConfigureTotpHandler implements ConfigureTotpUseCase {
  private readonly service: AccountSecurityService;

  constructor(service: AccountSecurityService) {
    this.service = service;
  }

  configureTotp(
    command: ConfigureTotpCommand,
  ): Promise<ConfigureTotpResult> {
    return this.service.configureTotp(command);
  }
}
