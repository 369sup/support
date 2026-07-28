import { describe, expect, it } from "vitest";

import { InMemoryAccountSecurityAdapter } from "../adapters/outbound/persistence/in-memory-account-security.adapter";
import type { SecurityRuntimeGatewayPort } from "../application/ports/outbound/security-runtime.gateway.port";
import type {
  TotpGatewayPort,
  TotpValidation,
} from "../application/ports/outbound/totp.gateway.port";
import type {
  PasskeyAuthenticationVerification,
  PasskeyRegistrationVerification,
  WebAuthnGatewayPort,
} from "../application/ports/outbound/webauthn.gateway.port";
import { AccountSecurityService } from "../application/services/account-security.service";

class SecurityRuntimeFake implements SecurityRuntimeGatewayPort {
  current = new Date("2026-07-28T00:00:00.000Z");
  private sequence = 0;

  hashSecret(secret: string): string {
    return `hash:${secret}`;
  }

  now(): Date {
    return this.current;
  }

  protectSecret(secret: string): string {
    return `protected:${secret}`;
  }

  randomId(): string {
    this.sequence += 1;
    return `security-id-${this.sequence}`;
  }

  randomRecoveryCode(): string {
    this.sequence += 1;
    return `recovery-code-${this.sequence}`;
  }

  revealSecret(protectedSecret: string): string {
    return protectedSecret.replace(/^protected:/, "");
  }
}

class TotpFake implements TotpGatewayPort {
  createEnrollment(label: string) {
    return {
      provisioningUri: `otpauth://totp/Support:${label}`,
      secret: `secret-${label}`,
    };
  }

  validate(_secret: string, token: string): TotpValidation {
    return token === "valid-token"
      ? { status: "valid", counter: 42 }
      : { status: "invalid" };
  }
}

class WebAuthnFake implements WebAuthnGatewayPort {
  createAuthenticationOptions() {
    return Promise.resolve({
      challenge: "authentication-challenge",
      options: { challenge: "authentication-challenge" },
    });
  }

  createRegistrationOptions() {
    return Promise.resolve({
      challenge: "registration-challenge",
      options: { challenge: "registration-challenge" },
    });
  }

  verifyAuthentication(): Promise<PasskeyAuthenticationVerification> {
    return Promise.resolve({ status: "verified", newCounter: 2 });
  }

  verifyRegistration(): Promise<PasskeyRegistrationVerification> {
    return Promise.resolve({
      status: "verified",
      credential: {
        counter: 1,
        credentialId: "passkey-credential",
        deviceType: "singleDevice",
        isBackedUp: false,
        publicKey: new Uint8Array([1, 2, 3]),
        transports: ["internal"],
        webauthnUserId: "account-security-passkey",
      },
    });
  }
}

function createService(accountSuffix: string) {
  const runtime = new SecurityRuntimeFake();
  const repository = new InMemoryAccountSecurityAdapter();
  return {
    accountId: `account-security-${accountSuffix}`,
    repository,
    runtime,
    service: new AccountSecurityService(
      repository,
      new TotpFake(),
      new WebAuthnFake(),
      runtime,
    ),
  };
}

describe("account security", () => {
  it("enables TOTP and consumes recovery codes only once", async () => {
    const { accountId, service } = createService("totp");
    await expect(
      service.configureTotp({
        action: "begin",
        accountId,
        username: "security-user",
      }),
    ).resolves.toMatchObject({ status: "enrollment-started" });
    const confirmed = await service.configureTotp({
      action: "confirm",
      accountId,
      token: "valid-token",
    });
    expect(confirmed.status).toBe("enabled");
    if (confirmed.status !== "enabled") {
      return;
    }
    expect(confirmed.recoveryCodes).toHaveLength(10);
    const factor = {
      kind: "recovery-code" as const,
      code: confirmed.recoveryCodes[0] ?? "",
    };
    await expect(
      service.verifyAdditionalFactor({ accountId, factor }),
    ).resolves.toEqual({ status: "verified" });
    await expect(
      service.verifyAdditionalFactor({ accountId, factor }),
    ).resolves.toEqual({ status: "invalid-factor" });
  });

  it("enforces the 72-hour two-factor recovery hold", async () => {
    const { accountId, runtime, service } = createService("recovery");
    await service.configureTotp({
      action: "begin",
      accountId,
      username: "recovery-user",
    });
    await service.configureTotp({
      action: "confirm",
      accountId,
      token: "valid-token",
    });
    const requested = await service.recoverTwoFactor({
      action: "request",
      accountId,
    });
    expect(requested.status).toBe("recovery-requested");
    if (requested.status !== "recovery-requested") {
      return;
    }
    await expect(
      service.recoverTwoFactor({
        action: "complete",
        accountId,
        requestId: requested.requestId,
      }),
    ).resolves.toEqual({ status: "hold-active" });
    runtime.current = new Date("2026-08-01T00:00:00.000Z");
    await expect(
      service.recoverTwoFactor({
        action: "complete",
        accountId,
        requestId: requested.requestId,
      }),
    ).resolves.toEqual({ status: "recovered" });
  });

  it("stores passkeys and advances their authentication counter", async () => {
    const { accountId, repository, service } = createService("passkey");
    const started = await service.managePasskey({
      action: "begin-registration",
      accountId,
      username: "passkey-user",
    });
    expect(started.status).toBe("options-created");
    if (started.status !== "options-created") {
      return;
    }
    await expect(
      service.managePasskey({
        action: "complete-registration",
        accountId,
        challengeId: started.challengeId,
        response: { id: "passkey-credential" },
      }),
    ).resolves.toMatchObject({ status: "passkey-registered" });
    const authentication = await service.managePasskey({
      action: "begin-authentication",
      accountId,
    });
    expect(authentication.status).toBe("options-created");
    if (authentication.status !== "options-created") {
      return;
    }
    await expect(
      service.managePasskey({
        action: "complete-authentication",
        accountId,
        challengeId: authentication.challengeId,
        response: { id: "passkey-credential" },
      }),
    ).resolves.toEqual({
      status: "verified",
      credentialId: "passkey-credential",
    });
    await expect(
      repository.findPasskey("passkey-credential"),
    ).resolves.toMatchObject({ counter: 2 });
  });
});
