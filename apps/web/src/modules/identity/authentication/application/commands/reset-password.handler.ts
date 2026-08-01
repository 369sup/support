import type {
  ResetPasswordCommand,
  ResetPasswordResult,
  ResetPasswordUseCase,
} from "../ports/inbound/reset-password.use-case";
import type { PasswordMaintenanceService } from "../services/password-maintenance.service";

export class ResetPasswordHandler implements ResetPasswordUseCase {
  private readonly service: PasswordMaintenanceService;

  constructor(service: PasswordMaintenanceService) {
    this.service = service;
  }

  resetPassword(
    command: ResetPasswordCommand,
  ): Promise<ResetPasswordResult> {
    return this.service.resetPassword(command);
  }
}
