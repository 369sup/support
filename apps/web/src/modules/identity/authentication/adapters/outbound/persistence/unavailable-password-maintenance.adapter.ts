import type {
  PasswordMaintenanceRepositoryPort,
  PasswordMaintenanceResult,
} from "../../../application/ports/outbound/password-maintenance.repository.port";

export class UnavailablePasswordMaintenanceAdapter
  implements PasswordMaintenanceRepositoryPort
{
  changePassword(): Promise<PasswordMaintenanceResult> {
    return Promise.resolve({ status: "credential-not-found" });
  }

  issueResetToken(): Promise<void> {
    return Promise.resolve();
  }

  resetPassword(): Promise<PasswordMaintenanceResult> {
    return Promise.resolve({ status: "invalid-reset-token" });
  }
}
