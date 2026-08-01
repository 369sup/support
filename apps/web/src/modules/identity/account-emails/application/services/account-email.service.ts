import type {
  AddAccountEmailCommand,
  AddAccountEmailResult,
} from "../ports/inbound/add-account-email.use-case";
import type {
  ListAccountEmailsQuery,
  ListAccountEmailsResult,
} from "../ports/inbound/list-account-emails.use-case";
import type {
  UpdateAccountEmailSettingsCommand,
  UpdateAccountEmailSettingsResult,
} from "../ports/inbound/update-account-email-settings.use-case";
import type {
  VerifyAccountEmailCommand,
  VerifyAccountEmailResult,
} from "../ports/inbound/verify-account-email.use-case";
import type { AccountEmailRepositoryPort } from "../ports/outbound/account-email.repository.port";
import type { AccountEmailRuntimeGatewayPort } from "../ports/outbound/account-email-runtime.gateway.port";
import type { EmailVerificationDeliveryGatewayPort } from "../ports/outbound/email-verification-delivery.gateway.port";

const verificationLifetimeMs = 60 * 60 * 1000;
const reuseQuarantineMs = 90 * 24 * 60 * 60 * 1000;

function normalizeAddress(address: string): string {
  return address.trim().toLocaleLowerCase("en-US");
}

function isValidEmailAddress(address: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}

function emailDomain(address: string): string {
  return address.split("@").at(-1) ?? "";
}

export class AccountEmailService {
  private readonly repository: AccountEmailRepositoryPort;
  private readonly runtime: AccountEmailRuntimeGatewayPort;
  private readonly delivery: EmailVerificationDeliveryGatewayPort;

  constructor(
    repository: AccountEmailRepositoryPort,
    runtime: AccountEmailRuntimeGatewayPort,
    delivery: EmailVerificationDeliveryGatewayPort,
  ) {
    this.repository = repository;
    this.runtime = runtime;
    this.delivery = delivery;
  }

  async addAccountEmail(
    command: AddAccountEmailCommand,
  ): Promise<AddAccountEmailResult> {
    const address = normalizeAddress(command.address);
    if (!isValidEmailAddress(address)) {
      return { status: "invalid-email" };
    }
    if (command.isManagedAccount && command.ownership !== "scim") {
      return { status: "managed-by-identity-provider" };
    }
    const existing = await this.repository.listByAccount(
      command.accountId,
    );
    if (command.isManagedAccount && existing.length > 0) {
      return { status: "account-email-limit" };
    }
    const email = {
      accountId: command.accountId,
      address,
      createdAt: this.runtime.now().toISOString(),
      emailId: this.runtime.randomId(),
      isPrimary: existing.length === 0,
      isPublic: false,
      isVerified: false,
      ownership: command.ownership,
    };
    const result = await this.repository.add(email);
    return result.status === "added"
      ? { status: "added", email }
      : result;
  }

  async listAccountEmails(
    query: ListAccountEmailsQuery,
  ): Promise<ListAccountEmailsResult> {
    if (query.accountId.trim() === "") {
      return { status: "invalid-account" };
    }
    return {
      status: "found",
      emails: await this.repository.listByAccount(query.accountId),
    };
  }

  async updateAccountEmailSettings(
    command: UpdateAccountEmailSettingsCommand,
  ): Promise<UpdateAccountEmailSettingsResult> {
    if (command.action === "set-organization-notification") {
      return this.setOrganizationNotificationEmail(command);
    }
    if (command.isManagedAccount) {
      return { status: "managed-by-identity-provider" };
    }
    if (!command.isSudoMode) {
      return { status: "sensitive-action-required" };
    }
    if (command.action === "clear-public") {
      await this.repository.setPublic(command.accountId, null);
      return { status: "updated" };
    }
    const email = await this.repository.findById(command.emailId);
    if (email === null || email.accountId !== command.accountId) {
      return { status: "email-not-found" };
    }
    if (command.action === "set-primary") {
      if (!email.isVerified) {
        return { status: "email-not-verified" };
      }
      const didUpdate = await this.repository.setPrimary(
        command.accountId,
        command.emailId,
      );
      return {
        status: didUpdate ? "updated" : "email-not-found",
      };
    }
    if (command.action === "set-public") {
      if (!email.isVerified) {
        return { status: "email-not-verified" };
      }
      const didUpdate = await this.repository.setPublic(
        command.accountId,
        command.emailId,
      );
      return {
        status: didUpdate ? "updated" : "email-not-found",
      };
    }
    if (email.isPrimary) {
      return { status: "primary-email-required" };
    }
    await this.repository.remove(
      command.emailId,
      new Date(
        this.runtime.now().getTime() + reuseQuarantineMs,
      ).toISOString(),
    );
    return { status: "updated" };
  }

  async verifyAccountEmail(
    command: VerifyAccountEmailCommand,
  ): Promise<VerifyAccountEmailResult> {
    if (command.action === "request") {
      const email = await this.repository.findById(command.emailId);
      if (email === null || email.accountId !== command.accountId) {
        return { status: "email-not-found" };
      }
      const token = this.runtime.randomToken();
      const tokenHash = this.runtime.hashToken(token);
      await this.repository.saveVerification({
        emailId: email.emailId,
        expiresAt: new Date(
          this.runtime.now().getTime() + verificationLifetimeMs,
        ).toISOString(),
        tokenHash,
      });
      const didDeliver = await this.delivery.deliverVerification({
        address: email.address,
        idempotencyKey: `verify-email:${email.emailId}:${tokenHash}`,
        token,
      });
      return {
        status: didDeliver ? "verification-sent" : "delivery-failed",
      };
    }
    const tokenHash = this.runtime.hashToken(command.token);
    const verification =
      await this.repository.findVerificationByTokenHash(tokenHash);
    if (verification === null) {
      return { status: "invalid-token" };
    }
    if (
      Date.parse(verification.expiresAt) <=
      this.runtime.now().getTime()
    ) {
      return { status: "verification-expired" };
    }
    const didVerify = await this.repository.verify(
      verification.emailId,
      tokenHash,
    );
    return {
      status: didVerify ? "verified" : "invalid-token",
    };
  }

  private async setOrganizationNotificationEmail(
    command: Extract<
      UpdateAccountEmailSettingsCommand,
      { action: "set-organization-notification" }
    >,
  ): Promise<UpdateAccountEmailSettingsResult> {
    const email = await this.repository.findById(command.emailId);
    if (email === null || email.accountId !== command.accountId) {
      return { status: "email-not-found" };
    }
    if (!email.isVerified) {
      return { status: "email-not-verified" };
    }
    const allowedDomains = new Set(
      command.allowedDomains.map((domain) =>
        domain.trim().toLocaleLowerCase("en-US"),
      ),
    );
    if (
      command.isRestrictionEnabled &&
      !command.isOutsideCollaborator &&
      !allowedDomains.has(emailDomain(email.address))
    ) {
      return { status: "notification-domain-restricted" };
    }
    await this.repository.saveOrganizationNotificationRoute({
      accountId: command.accountId,
      emailId: command.emailId,
      organizationId: command.organizationId,
      updatedAt: this.runtime.now().toISOString(),
    });
    return { status: "updated" };
  }
}
