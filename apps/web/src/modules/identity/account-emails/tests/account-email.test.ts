import { describe, expect, it } from "vitest";

import { InMemoryAccountEmailAdapter } from "../adapters/outbound/persistence/in-memory-account-email.adapter";
import type { AccountEmailRuntimeGatewayPort } from "../application/ports/outbound/account-email-runtime.gateway.port";
import type { EmailVerificationDeliveryGatewayPort } from "../application/ports/outbound/email-verification-delivery.gateway.port";
import { AccountEmailService } from "../application/services/account-email.service";

class RuntimeFake implements AccountEmailRuntimeGatewayPort {
  current = new Date("2026-07-28T00:00:00.000Z");
  lastToken = "";
  private sequence = 0;

  hashToken(token: string): string {
    return `hash:${token}`;
  }

  now(): Date {
    return this.current;
  }

  randomId(): string {
    this.sequence += 1;
    return `email-id-${this.sequence}`;
  }

  randomToken(): string {
    this.sequence += 1;
    this.lastToken = `email-token-${this.sequence}`;
    return this.lastToken;
  }
}

function createService() {
  const runtime = new RuntimeFake();
  const delivery: EmailVerificationDeliveryGatewayPort = {
    deliverVerification: () => Promise.resolve(true),
  };
  return {
    runtime,
    service: new AccountEmailService(
      new InMemoryAccountEmailAdapter({
        emails: new Map(),
        quarantineByAddress: new Map(),
        routes: new Map(),
        verifications: new Map(),
      }),
      runtime,
      delivery,
    ),
  };
}

describe("account emails", () => {
  it("adds, verifies, and promotes a primary email", async () => {
    const { runtime, service } = createService();
    const first = await service.addAccountEmail({
      accountId: "account-email-test",
      address: "first@example.com",
      isManagedAccount: false,
      ownership: "personal",
    });
    const second = await service.addAccountEmail({
      accountId: "account-email-test",
      address: "second@example.com",
      isManagedAccount: false,
      ownership: "personal",
    });
    expect(first).toMatchObject({
      status: "added",
      email: { isPrimary: true },
    });
    expect(second.status).toBe("added");
    if (second.status !== "added") {
      return;
    }
    await service.verifyAccountEmail({
      action: "request",
      accountId: "account-email-test",
      emailId: second.email.emailId,
    });
    await expect(
      service.verifyAccountEmail({
        action: "confirm",
        token: runtime.lastToken,
      }),
    ).resolves.toEqual({ status: "verified" });
    await expect(
      service.updateAccountEmailSettings({
        action: "set-primary",
        accountId: "account-email-test",
        emailId: second.email.emailId,
        isManagedAccount: false,
        isSudoMode: true,
      }),
    ).resolves.toEqual({ status: "updated" });
  });

  it("enforces approved domains for organization notifications", async () => {
    const { runtime, service } = createService();
    const added = await service.addAccountEmail({
      accountId: "account-domain-test",
      address: "member@external.example",
      isManagedAccount: false,
      ownership: "personal",
    });
    if (added.status !== "added") {
      return;
    }
    await service.verifyAccountEmail({
      action: "request",
      accountId: "account-domain-test",
      emailId: added.email.emailId,
    });
    await service.verifyAccountEmail({
      action: "confirm",
      token: runtime.lastToken,
    });
    await expect(
      service.updateAccountEmailSettings({
        action: "set-organization-notification",
        accountId: "account-domain-test",
        allowedDomains: ["company.example"],
        emailId: added.email.emailId,
        isOutsideCollaborator: false,
        isRestrictionEnabled: true,
        organizationId: "organization-domain-test",
      }),
    ).resolves.toEqual({
      status: "notification-domain-restricted",
    });
  });

  it("keeps managed email ownership with SCIM", async () => {
    const { service } = createService();
    await expect(
      service.addAccountEmail({
        accountId: "managed-account-email-test",
        address: "managed@example.com",
        isManagedAccount: true,
        ownership: "personal",
      }),
    ).resolves.toEqual({ status: "managed-by-identity-provider" });
    await expect(
      service.addAccountEmail({
        accountId: "managed-account-email-test",
        address: "managed@example.com",
        isManagedAccount: true,
        ownership: "scim",
      }),
    ).resolves.toMatchObject({ status: "added" });
  });
});
