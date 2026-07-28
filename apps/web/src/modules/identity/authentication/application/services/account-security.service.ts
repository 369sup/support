import type {
  ConfigureTotpCommand,
  ConfigureTotpResult,
} from "../ports/inbound/configure-totp.use-case";
import type {
  EnterSudoModeCommand,
  EnterSudoModeResult,
} from "../ports/inbound/enter-sudo-mode.use-case";
import type {
  ManagePasskeyCommand,
  ManagePasskeyResult,
} from "../ports/inbound/manage-passkey.use-case";
import type {
  RecoverTwoFactorCommand,
  RecoverTwoFactorResult,
} from "../ports/inbound/recover-two-factor.use-case";
import type {
  VerifyAdditionalFactorCommand,
  VerifyAdditionalFactorResult,
} from "../ports/inbound/verify-additional-factor.use-case";
import type { AccountSecurityRepositoryPort } from "../ports/outbound/account-security.repository.port";
import type { SecurityRuntimeGatewayPort } from "../ports/outbound/security-runtime.gateway.port";
import type { TotpGatewayPort } from "../ports/outbound/totp.gateway.port";
import type { WebAuthnGatewayPort } from "../ports/outbound/webauthn.gateway.port";

const passkeyChallengeLifetimeMs = 5 * 60 * 1000;
const recoveryHoldMs = 72 * 60 * 60 * 1000;
const sudoLifetimeMs = 15 * 60 * 1000;
const recoveryCodeCount = 10;

function readResponseCredentialId(response: unknown): string | null {
  return response !== null &&
    typeof response === "object" &&
    "id" in response &&
    typeof response.id === "string" &&
    response.id.length > 0
    ? response.id
    : null;
}

export class AccountSecurityService {
  private readonly repository: AccountSecurityRepositoryPort;
  private readonly totp: TotpGatewayPort;
  private readonly webauthn: WebAuthnGatewayPort;
  private readonly runtime: SecurityRuntimeGatewayPort;

  constructor(
    repository: AccountSecurityRepositoryPort,
    totp: TotpGatewayPort,
    webauthn: WebAuthnGatewayPort,
    runtime: SecurityRuntimeGatewayPort,
  ) {
    this.repository = repository;
    this.totp = totp;
    this.webauthn = webauthn;
    this.runtime = runtime;
  }

  async configureTotp(
    command: ConfigureTotpCommand,
  ): Promise<ConfigureTotpResult> {
    if (command.accountId.trim() === "") {
      return { status: "invalid-account" };
    }
    if (command.action === "begin") {
      const enrollment = this.totp.createEnrollment(command.username);
      await this.repository.beginTotpEnrollment(
        command.accountId,
        this.runtime.protectSecret(enrollment.secret),
      );
      return {
        status: "enrollment-started",
        provisioningUri: enrollment.provisioningUri,
        secret: enrollment.secret,
      };
    }

    const configuration =
      await this.repository.findTwoFactorConfiguration(command.accountId);
    if (
      configuration === null ||
      configuration.pendingTotpSecret === null
    ) {
      return { status: "configuration-not-found" };
    }
    const secret = this.runtime.revealSecret(
      configuration.pendingTotpSecret,
    );
    const validation = this.totp.validate(secret, command.token);
    if (validation.status === "invalid") {
      return { status: "invalid-token" };
    }
    const didEnable = await this.repository.enableTotp(
      command.accountId,
      validation.counter,
    );
    if (!didEnable) {
      return { status: "token-reused" };
    }
    const recoveryCodes = Array.from(
      { length: recoveryCodeCount },
      () => this.runtime.randomRecoveryCode(),
    );
    await this.repository.replaceRecoveryCodes(
      command.accountId,
      recoveryCodes.map((code) => this.runtime.hashSecret(code)),
    );
    return { status: "enabled", recoveryCodes };
  }

  async enterSudoMode(
    command: EnterSudoModeCommand,
  ): Promise<EnterSudoModeResult> {
    const verification = await this.verifyAdditionalFactor(command);
    if (verification.status === "configuration-not-found") {
      return { status: "configuration-not-found" };
    }
    if (verification.status !== "verified") {
      return { status: "invalid-factor" };
    }
    const sudoUntil = new Date(
      this.runtime.now().getTime() + sudoLifetimeMs,
    ).toISOString();
    await this.repository.setSudoUntil(command.accountId, sudoUntil);
    return { status: "entered", sudoUntil };
  }

  async isTwoFactorRequired(accountId: string): Promise<boolean> {
    const configuration =
      await this.repository.findTwoFactorConfiguration(accountId);
    return configuration?.isEnabled ?? false;
  }

  async managePasskey(
    command: ManagePasskeyCommand,
  ): Promise<ManagePasskeyResult> {
    if (command.accountId.trim() === "") {
      return { status: "invalid-account" };
    }
    if (command.action === "begin-registration") {
      const passkeys = await this.repository.listPasskeys(
        command.accountId,
      );
      const result = await this.webauthn.createRegistrationOptions({
        accountId: command.accountId,
        username: command.username,
        passkeys,
      });
      return this.savePasskeyChallenge(
        command.accountId,
        "passkey-registration",
        result.challenge,
        result.options,
      );
    }
    if (command.action === "begin-authentication") {
      const passkeys = await this.repository.listPasskeys(
        command.accountId,
      );
      if (passkeys.length === 0) {
        return { status: "passkey-not-found" };
      }
      const result =
        await this.webauthn.createAuthenticationOptions(passkeys);
      return this.savePasskeyChallenge(
        command.accountId,
        "passkey-authentication",
        result.challenge,
        result.options,
      );
    }

    const challenge = await this.repository.consumeChallenge(
      command.challengeId,
      this.runtime.now().toISOString(),
    );
    if (challenge === null) {
      return { status: "challenge-not-found" };
    }
    if (
      challenge.accountId !== command.accountId ||
      Date.parse(challenge.expiresAt) <= this.runtime.now().getTime()
    ) {
      return { status: "challenge-expired" };
    }
    if (command.action === "complete-registration") {
      if (challenge.kind !== "passkey-registration") {
        return { status: "invalid-response" };
      }
      const verification = await this.webauthn.verifyRegistration({
        challenge: challenge.challenge,
        response: command.response,
        webauthnUserId: command.accountId,
      });
      if (verification.status === "invalid") {
        return { status: "invalid-response" };
      }
      await this.repository.savePasskey({
        ...verification.credential,
        accountId: command.accountId,
      });
      return {
        status: "passkey-registered",
        credentialId: verification.credential.credentialId,
      };
    }

    if (challenge.kind !== "passkey-authentication") {
      return { status: "invalid-response" };
    }
    const credentialId = readResponseCredentialId(command.response);
    if (credentialId === null) {
      return { status: "invalid-response" };
    }
    const passkey = await this.repository.findPasskey(credentialId);
    if (passkey === null || passkey.accountId !== command.accountId) {
      return { status: "passkey-not-found" };
    }
    const verification = await this.webauthn.verifyAuthentication({
      challenge: challenge.challenge,
      passkey,
      response: command.response,
    });
    if (verification.status === "invalid") {
      return { status: "invalid-response" };
    }
    await this.repository.updatePasskeyCounter(
      passkey.credentialId,
      verification.newCounter,
      this.runtime.now().toISOString(),
    );
    return { status: "verified", credentialId };
  }

  async recoverTwoFactor(
    command: RecoverTwoFactorCommand,
  ): Promise<RecoverTwoFactorResult> {
    const configuration =
      await this.repository.findTwoFactorConfiguration(command.accountId);
    if (configuration === null || !configuration.isEnabled) {
      return { status: "configuration-not-found" };
    }
    if (command.action === "request") {
      const requestedAt = this.runtime.now();
      const requestId = this.runtime.randomId();
      const availableAt = new Date(
        requestedAt.getTime() + recoveryHoldMs,
      ).toISOString();
      await this.repository.createTwoFactorRecoveryRequest({
        accountId: command.accountId,
        availableAt,
        completedAt: null,
        requestId,
        requestedAt: requestedAt.toISOString(),
      });
      return {
        status: "recovery-requested",
        availableAt,
        requestId,
      };
    }
    const request =
      await this.repository.findTwoFactorRecoveryRequest(
        command.requestId,
      );
    if (request === null) {
      return { status: "request-not-found" };
    }
    if (
      request.accountId !== command.accountId ||
      request.completedAt !== null
    ) {
      return { status: "invalid-request" };
    }
    if (Date.parse(request.availableAt) > this.runtime.now().getTime()) {
      return { status: "hold-active" };
    }
    const completedAt = this.runtime.now().toISOString();
    const didComplete =
      await this.repository.completeTwoFactorRecovery(
        command.requestId,
        completedAt,
      );
    if (!didComplete) {
      return { status: "invalid-request" };
    }
    await this.repository.disableTwoFactor(command.accountId);
    return { status: "recovered" };
  }

  async verifyAdditionalFactor(
    command: VerifyAdditionalFactorCommand,
  ): Promise<VerifyAdditionalFactorResult> {
    const configuration =
      await this.repository.findTwoFactorConfiguration(command.accountId);
    if (configuration === null) {
      return { status: "configuration-not-found" };
    }
    if (!configuration.isEnabled || configuration.totpSecret === null) {
      return { status: "factor-not-required" };
    }
    if (command.factor.kind === "recovery-code") {
      const didConsume = await this.repository.consumeRecoveryCode(
        command.accountId,
        this.runtime.hashSecret(command.factor.code),
        this.runtime.now().toISOString(),
      );
      return {
        status: didConsume ? "verified" : "invalid-factor",
      };
    }
    const secret = this.runtime.revealSecret(
      configuration.totpSecret,
    );
    const validation = this.totp.validate(
      secret,
      command.factor.token,
    );
    if (validation.status === "invalid") {
      return { status: "invalid-factor" };
    }
    const didAdvance = await this.repository.updateTotpCounter(
      command.accountId,
      configuration.lastTotpCounter,
      validation.counter,
    );
    return {
      status: didAdvance ? "verified" : "invalid-factor",
    };
  }

  private async savePasskeyChallenge(
    accountId: string,
    kind: "passkey-authentication" | "passkey-registration",
    challenge: string,
    options: unknown,
  ): Promise<ManagePasskeyResult> {
    const challengeId = this.runtime.randomId();
    await this.repository.saveChallenge({
      accountId,
      challenge,
      challengeId,
      expiresAt: new Date(
        this.runtime.now().getTime() + passkeyChallengeLifetimeMs,
      ).toISOString(),
      kind,
    });
    return { status: "options-created", challengeId, options };
  }
}
