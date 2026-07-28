import { describe, expect, it } from "vitest";

import type { AccountSessionRevocationPort } from "../application/ports/outbound/account-session-revocation.port";
import type {
  PasswordMaintenanceRepositoryPort,
  PasswordMaintenanceResult,
} from "../application/ports/outbound/password-maintenance.repository.port";
import type { PasswordMaintenanceRuntimeGatewayPort } from "../application/ports/outbound/password-maintenance-runtime.gateway.port";
import type { PasswordRecoveryDeliveryGatewayPort } from "../application/ports/outbound/password-recovery-delivery.gateway.port";
import { PasswordMaintenanceService } from "../application/services/password-maintenance.service";

class PasswordMaintenanceRepositoryFake
  implements PasswordMaintenanceRepositoryPort
{
  changeResult: PasswordMaintenanceResult = {
    status: "changed",
    accountId: "account-1",
  };
  issuedToken:
    | Readonly<{
        accountId: string;
        expiresAt: string;
        tokenHash: string;
      }>
    | undefined;
  resetResult: PasswordMaintenanceResult = {
    status: "reset",
    accountId: "account-1",
  };

  changePassword(): Promise<PasswordMaintenanceResult> {
    return Promise.resolve(this.changeResult);
  }

  issueResetToken(input: {
    accountId: string;
    expiresAt: string;
    tokenHash: string;
  }): Promise<void> {
    this.issuedToken = input;
    return Promise.resolve();
  }

  resetPassword(): Promise<PasswordMaintenanceResult> {
    return Promise.resolve(this.resetResult);
  }
}

class SessionRevocationFake implements AccountSessionRevocationPort {
  readonly revokedAccountIds: string[] = [];

  revokeAccountSessions(accountId: string): Promise<void> {
    this.revokedAccountIds.push(accountId);
    return Promise.resolve();
  }
}

class PasswordRuntimeFake
  implements PasswordMaintenanceRuntimeGatewayPort
{
  hashToken(token: string): string {
    return `hash:${token}`;
  }

  now(): Date {
    return new Date("2026-07-28T00:00:00.000Z");
  }

  randomToken(): string {
    return "raw-reset-token";
  }
}

class PasswordDeliveryFake
  implements PasswordRecoveryDeliveryGatewayPort
{
  delivered:
    | Readonly<{
        address: string;
        idempotencyKey: string;
        token: string;
      }>
    | undefined;

  deliverPasswordReset(input: {
    address: string;
    idempotencyKey: string;
    token: string;
  }): Promise<boolean> {
    this.delivered = input;
    return Promise.resolve(true);
  }
}

function createService() {
  const delivery = new PasswordDeliveryFake();
  const repository = new PasswordMaintenanceRepositoryFake();
  const sessions = new SessionRevocationFake();
  return {
    delivery,
    repository,
    service: new PasswordMaintenanceService(
      repository,
      sessions,
      new PasswordRuntimeFake(),
      delivery,
    ),
    sessions,
  };
}

describe("password maintenance", () => {
  it("issues a one-hour hashed reset token and delivers the raw token", async () => {
    const { delivery, repository, service } = createService();

    await expect(
      service.requestPasswordReset({
        accountId: "account-1",
        address: " Person@Example.com ",
      }),
    ).resolves.toEqual({ status: "reset-requested" });
    expect(repository.issuedToken).toEqual({
      accountId: "account-1",
      expiresAt: "2026-07-28T01:00:00.000Z",
      tokenHash: "hash:raw-reset-token",
    });
    expect(delivery.delivered).toEqual({
      address: "person@example.com",
      idempotencyKey:
        "password-reset:account-1:hash:raw-reset-token",
      token: "raw-reset-token",
    });
  });

  it("requires sudo mode before changing a password", async () => {
    const { service, sessions } = createService();

    await expect(
      service.changePassword({
        accountId: "account-1",
        currentPassword: "old-password-value",
        isSudoMode: false,
        newPassword: "new-password-value",
      }),
    ).resolves.toEqual({ status: "sensitive-action-required" });
    expect(sessions.revokedAccountIds).toEqual([]);
  });

  it("revokes every account session after a reset or password change", async () => {
    const { service, sessions } = createService();

    await expect(
      service.resetPassword({
        newPassword: "new-password-value",
        token: "raw-reset-token",
      }),
    ).resolves.toEqual({ status: "reset" });
    await expect(
      service.changePassword({
        accountId: "account-1",
        currentPassword: "new-password-value",
        isSudoMode: true,
        newPassword: "next-password-value",
      }),
    ).resolves.toEqual({ status: "changed" });
    expect(sessions.revokedAccountIds).toEqual([
      "account-1",
      "account-1",
    ]);
  });
});
