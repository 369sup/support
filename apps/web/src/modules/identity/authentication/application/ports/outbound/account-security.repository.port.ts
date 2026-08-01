import type {
  AuthenticationChallenge,
  PasskeyCredential,
  TwoFactorConfiguration,
  TwoFactorRecoveryRequest,
} from "../../../domain/account-security";

export interface AccountSecurityRepositoryPort {
  beginTotpEnrollment(
    accountId: string,
    protectedSecret: string,
  ): Promise<void>;
  completeTwoFactorRecovery(
    requestId: string,
    completedAt: string,
  ): Promise<boolean>;
  consumeChallenge(
    challengeId: string,
    consumedAt: string,
  ): Promise<AuthenticationChallenge | null>;
  consumeRecoveryCode(
    accountId: string,
    codeHash: string,
    consumedAt: string,
  ): Promise<boolean>;
  createTwoFactorRecoveryRequest(
    request: TwoFactorRecoveryRequest,
  ): Promise<void>;
  disableTwoFactor(accountId: string): Promise<void>;
  enableTotp(
    accountId: string,
    lastTotpCounter: number,
  ): Promise<boolean>;
  findChallenge(
    challengeId: string,
  ): Promise<AuthenticationChallenge | null>;
  findPasskey(
    credentialId: string,
  ): Promise<PasskeyCredential | null>;
  findTwoFactorConfiguration(
    accountId: string,
  ): Promise<TwoFactorConfiguration | null>;
  findTwoFactorRecoveryRequest(
    requestId: string,
  ): Promise<TwoFactorRecoveryRequest | null>;
  listPasskeys(accountId: string): Promise<readonly PasskeyCredential[]>;
  replaceRecoveryCodes(
    accountId: string,
    codeHashes: readonly string[],
  ): Promise<void>;
  saveChallenge(challenge: AuthenticationChallenge): Promise<void>;
  savePasskey(passkey: PasskeyCredential): Promise<void>;
  setSudoUntil(accountId: string, sudoUntil: string): Promise<void>;
  updatePasskeyCounter(
    credentialId: string,
    counter: number,
    usedAt: string,
  ): Promise<void>;
  updateTotpCounter(
    accountId: string,
    expectedPreviousCounter: number | null,
    counter: number,
  ): Promise<boolean>;
}
