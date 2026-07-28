export type TwoFactorConfiguration = Readonly<{
  accountId: string;
  isEnabled: boolean;
  pendingTotpSecret: string | null;
  totpSecret: string | null;
  lastTotpCounter: number | null;
  sudoUntil: string | null;
}>;

export type AuthenticationChallenge = Readonly<{
  accountId: string;
  challenge: string;
  challengeId: string;
  expiresAt: string;
  kind: "passkey-authentication" | "passkey-registration";
}>;

export type PasskeyCredential = Readonly<{
  accountId: string;
  isBackedUp: boolean;
  counter: number;
  credentialId: string;
  deviceType: string;
  publicKey: Uint8Array<ArrayBuffer>;
  transports: readonly string[];
  webauthnUserId: string;
}>;

export type TwoFactorRecoveryRequest = Readonly<{
  accountId: string;
  availableAt: string;
  completedAt: string | null;
  requestId: string;
  requestedAt: string;
}>;
