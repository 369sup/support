import type {
  RequestPasswordResetCommand,
  RequestPasswordResetResult,
  RequestPasswordResetUseCase,
} from "../ports/inbound/request-password-reset.use-case";
import type { PasswordMaintenanceService } from "../services/password-maintenance.service";

export class RequestPasswordResetHandler
  implements RequestPasswordResetUseCase
{
  private readonly service: PasswordMaintenanceService;

  constructor(service: PasswordMaintenanceService) {
    this.service = service;
  }

  requestPasswordReset(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    return this.service.requestPasswordReset(command);
  }
}
