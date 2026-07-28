import type {
  ChangePasswordCommand,
  ChangePasswordResult,
  ChangePasswordUseCase,
} from "../ports/inbound/change-password.use-case";
import type { PasswordMaintenanceService } from "../services/password-maintenance.service";

export class ChangePasswordHandler implements ChangePasswordUseCase {
  private readonly service: PasswordMaintenanceService;

  constructor(service: PasswordMaintenanceService) {
    this.service = service;
  }

  changePassword(
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResult> {
    return this.service.changePassword(command);
  }
}
