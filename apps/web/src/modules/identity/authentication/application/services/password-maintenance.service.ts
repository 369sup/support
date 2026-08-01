import type {
  ChangePasswordCommand,
  ChangePasswordResult,
} from "../ports/inbound/change-password.use-case";
import type {
  RequestPasswordResetCommand,
  RequestPasswordResetResult,
} from "../ports/inbound/request-password-reset.use-case";
import type {
  ResetPasswordCommand,
  ResetPasswordResult,
} from "../ports/inbound/reset-password.use-case";
import type { AccountSessionRevocationPort } from "../ports/outbound/account-session-revocation.port";
import type { PasswordMaintenanceRepositoryPort } from "../ports/outbound/password-maintenance.repository.port";
import type { PasswordMaintenanceRuntimeGatewayPort } from "../ports/outbound/password-maintenance-runtime.gateway.port";
import type { PasswordRecoveryDeliveryGatewayPort } from "../ports/outbound/password-recovery-delivery.gateway.port";

const passwordResetLifetimeMs = 60 * 60 * 1000;
const minimumPasswordLength = 12;

function isValidEmailAddress(address: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

function isValidNewPassword(password: string): boolean {
  return password.length >= minimumPasswordLength;
}

export class PasswordMaintenanceService {
  private readonly repository: PasswordMaintenanceRepositoryPort;
  private readonly sessions: AccountSessionRevocationPort;
  private readonly runtime: PasswordMaintenanceRuntimeGatewayPort;
  private readonly delivery: PasswordRecoveryDeliveryGatewayPort;

  constructor(
    repository: PasswordMaintenanceRepositoryPort,
    sessions: AccountSessionRevocationPort,
    runtime: PasswordMaintenanceRuntimeGatewayPort,
    delivery: PasswordRecoveryDeliveryGatewayPort,
  ) {
    this.repository = repository;
    this.sessions = sessions;
    this.runtime = runtime;
    this.delivery = delivery;
  }

  async changePassword(
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResult> {
    if (!command.isSudoMode) {
      return { status: "sensitive-action-required" };
    }
    if (!isValidNewPassword(command.newPassword)) {
      return { status: "invalid-password" };
    }
    const result = await this.repository.changePassword(command);
    if (result.status === "changed") {
      await this.sessions.revokeAccountSessions(result.accountId);
      return { status: "changed" };
    }
    if (
      result.status === "credential-not-found" ||
      result.status === "invalid-current-password" ||
      result.status === "password-reused"
    ) {
      return { status: result.status };
    }
    return { status: "credential-not-found" };
  }

  async requestPasswordReset(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    const address = command.address.trim().toLocaleLowerCase("en-US");
    if (
      command.accountId.trim() === "" ||
      !isValidEmailAddress(address)
    ) {
      return { status: "invalid-request" };
    }
    const token = this.runtime.randomToken();
    const tokenHash = this.runtime.hashToken(token);
    await this.repository.issueResetToken({
      accountId: command.accountId,
      expiresAt: new Date(
        this.runtime.now().getTime() + passwordResetLifetimeMs,
      ).toISOString(),
      tokenHash,
    });
    const didDeliver = await this.delivery.deliverPasswordReset({
      address,
      idempotencyKey: `password-reset:${command.accountId}:${tokenHash}`,
      token,
    });
    return {
      status: didDeliver ? "reset-requested" : "delivery-failed",
    };
  }

  async resetPassword(
    command: ResetPasswordCommand,
  ): Promise<ResetPasswordResult> {
    if (!isValidNewPassword(command.newPassword)) {
      return { status: "invalid-password" };
    }
    const result = await this.repository.resetPassword({
      newPassword: command.newPassword,
      tokenHash: this.runtime.hashToken(command.token),
    });
    if (result.status === "reset") {
      await this.sessions.revokeAccountSessions(result.accountId);
      return { status: "reset" };
    }
    if (
      result.status === "invalid-reset-token" ||
      result.status === "password-reused" ||
      result.status === "reset-token-expired"
    ) {
      return { status: result.status };
    }
    return { status: "invalid-reset-token" };
  }
}
