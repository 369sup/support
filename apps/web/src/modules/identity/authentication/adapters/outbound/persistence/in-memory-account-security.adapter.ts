import type { AccountSecurityRepositoryPort } from "../../../application/ports/outbound/account-security.repository.port";
import type {
  AuthenticationChallenge,
  PasskeyCredential,
  TwoFactorConfiguration,
  TwoFactorRecoveryRequest,
} from "../../../domain/account-security";

type StoredChallenge = AuthenticationChallenge &
  Readonly<{ consumedAt: string | null }>;

type AccountSecurityStore = {
  challenges: Map<string, StoredChallenge>;
  configurations: Map<string, TwoFactorConfiguration>;
  passkeys: Map<string, PasskeyCredential>;
  passkeyLastUsedAt: Map<string, string>;
  recoveryCodes: Map<string, Map<string, string | null>>;
  recoveryRequests: Map<string, TwoFactorRecoveryRequest>;
};

declare global {
  var __supportAccountSecurityStoreV1:
    | AccountSecurityStore
    | undefined;
}

function getProcessStore(): AccountSecurityStore {
  globalThis.__supportAccountSecurityStoreV1 ??= {
    challenges: new Map(),
    configurations: new Map(),
    passkeys: new Map(),
    passkeyLastUsedAt: new Map(),
    recoveryCodes: new Map(),
    recoveryRequests: new Map(),
  };
  return globalThis.__supportAccountSecurityStoreV1;
}

export class InMemoryAccountSecurityAdapter
  implements AccountSecurityRepositoryPort
{
  private readonly store: AccountSecurityStore;

  constructor(store: AccountSecurityStore = getProcessStore()) {
    this.store = store;
  }

  beginTotpEnrollment(
    accountId: string,
    protectedSecret: string,
  ): Promise<void> {
    const current = this.store.configurations.get(accountId);
    this.store.configurations.set(accountId, {
      accountId,
      isEnabled: current?.isEnabled ?? false,
      lastTotpCounter: current?.lastTotpCounter ?? null,
      pendingTotpSecret: protectedSecret,
      sudoUntil: current?.sudoUntil ?? null,
      totpSecret: current?.totpSecret ?? null,
    });
    return Promise.resolve();
  }

  completeTwoFactorRecovery(
    requestId: string,
    completedAt: string,
  ): Promise<boolean> {
    const request = this.store.recoveryRequests.get(requestId);
    if (request === undefined || request.completedAt !== null) {
      return Promise.resolve(false);
    }
    this.store.recoveryRequests.set(requestId, {
      ...request,
      completedAt,
    });
    return Promise.resolve(true);
  }

  consumeChallenge(
    challengeId: string,
    consumedAt: string,
  ): Promise<AuthenticationChallenge | null> {
    const challenge = this.store.challenges.get(challengeId);
    if (challenge === undefined || challenge.consumedAt !== null) {
      return Promise.resolve(null);
    }
    this.store.challenges.set(challengeId, {
      ...challenge,
      consumedAt,
    });
    return Promise.resolve({
      accountId: challenge.accountId,
      challenge: challenge.challenge,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      kind: challenge.kind,
    });
  }

  consumeRecoveryCode(
    accountId: string,
    codeHash: string,
    consumedAt: string,
  ): Promise<boolean> {
    const codes = this.store.recoveryCodes.get(accountId);
    if (codes?.get(codeHash) !== null) {
      return Promise.resolve(false);
    }
    codes.set(codeHash, consumedAt);
    return Promise.resolve(true);
  }

  createTwoFactorRecoveryRequest(
    request: TwoFactorRecoveryRequest,
  ): Promise<void> {
    this.store.recoveryRequests.set(request.requestId, { ...request });
    return Promise.resolve();
  }

  disableTwoFactor(accountId: string): Promise<void> {
    const configuration = this.store.configurations.get(accountId);
    if (configuration !== undefined) {
      this.store.configurations.set(accountId, {
        ...configuration,
        isEnabled: false,
        lastTotpCounter: null,
        pendingTotpSecret: null,
        sudoUntil: null,
        totpSecret: null,
      });
    }
    this.store.recoveryCodes.delete(accountId);
    return Promise.resolve();
  }

  enableTotp(
    accountId: string,
    lastTotpCounter: number,
  ): Promise<boolean> {
    const configuration = this.store.configurations.get(accountId);
    if (
      configuration === undefined ||
      configuration.pendingTotpSecret === null ||
      (configuration.lastTotpCounter !== null &&
        configuration.lastTotpCounter >= lastTotpCounter)
    ) {
      return Promise.resolve(false);
    }
    this.store.configurations.set(accountId, {
      ...configuration,
      isEnabled: true,
      lastTotpCounter,
      pendingTotpSecret: null,
      totpSecret: configuration.pendingTotpSecret,
    });
    return Promise.resolve(true);
  }

  findChallenge(
    challengeId: string,
  ): Promise<AuthenticationChallenge | null> {
    const challenge = this.store.challenges.get(challengeId);
    if (challenge === undefined || challenge.consumedAt !== null) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      accountId: challenge.accountId,
      challenge: challenge.challenge,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      kind: challenge.kind,
    });
  }

  findPasskey(
    credentialId: string,
  ): Promise<PasskeyCredential | null> {
    return Promise.resolve(
      this.store.passkeys.get(credentialId) ?? null,
    );
  }

  findTwoFactorConfiguration(
    accountId: string,
  ): Promise<TwoFactorConfiguration | null> {
    return Promise.resolve(
      this.store.configurations.get(accountId) ?? null,
    );
  }

  findTwoFactorRecoveryRequest(
    requestId: string,
  ): Promise<TwoFactorRecoveryRequest | null> {
    return Promise.resolve(
      this.store.recoveryRequests.get(requestId) ?? null,
    );
  }

  listPasskeys(
    accountId: string,
  ): Promise<readonly PasskeyCredential[]> {
    return Promise.resolve(
      [...this.store.passkeys.values()].filter(
        (passkey) => passkey.accountId === accountId,
      ),
    );
  }

  replaceRecoveryCodes(
    accountId: string,
    codeHashes: readonly string[],
  ): Promise<void> {
    this.store.recoveryCodes.set(
      accountId,
      new Map(codeHashes.map((codeHash) => [codeHash, null])),
    );
    return Promise.resolve();
  }

  saveChallenge(challenge: AuthenticationChallenge): Promise<void> {
    this.store.challenges.set(challenge.challengeId, {
      ...challenge,
      consumedAt: null,
    });
    return Promise.resolve();
  }

  savePasskey(passkey: PasskeyCredential): Promise<void> {
    this.store.passkeys.set(passkey.credentialId, { ...passkey });
    return Promise.resolve();
  }

  setSudoUntil(accountId: string, sudoUntil: string): Promise<void> {
    const configuration = this.store.configurations.get(accountId);
    if (configuration !== undefined) {
      this.store.configurations.set(accountId, {
        ...configuration,
        sudoUntil,
      });
    }
    return Promise.resolve();
  }

  updatePasskeyCounter(
    credentialId: string,
    counter: number,
    usedAt: string,
  ): Promise<void> {
    const passkey = this.store.passkeys.get(credentialId);
    if (passkey !== undefined) {
      this.store.passkeys.set(credentialId, { ...passkey, counter });
      this.store.passkeyLastUsedAt.set(credentialId, usedAt);
    }
    return Promise.resolve();
  }

  updateTotpCounter(
    accountId: string,
    expectedPreviousCounter: number | null,
    counter: number,
  ): Promise<boolean> {
    const configuration = this.store.configurations.get(accountId);
    if (
      configuration === undefined ||
      configuration.lastTotpCounter !== expectedPreviousCounter ||
      (configuration.lastTotpCounter !== null &&
        configuration.lastTotpCounter >= counter)
    ) {
      return Promise.resolve(false);
    }
    this.store.configurations.set(accountId, {
      ...configuration,
      lastTotpCounter: counter,
    });
    return Promise.resolve(true);
  }
}
