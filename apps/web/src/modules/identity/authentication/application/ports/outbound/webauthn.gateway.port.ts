import type { PasskeyCredential } from "../../../domain/account-security";

export type PasskeyRegistrationVerification =
  | Readonly<{
      status: "verified";
      credential: Omit<PasskeyCredential, "accountId">;
    }>
  | Readonly<{ status: "invalid" }>;

export type PasskeyAuthenticationVerification =
  | Readonly<{ status: "verified"; newCounter: number }>
  | Readonly<{ status: "invalid" }>;

export interface WebAuthnGatewayPort {
  createAuthenticationOptions(
    passkeys: readonly PasskeyCredential[],
  ): Promise<Readonly<{ challenge: string; options: unknown }>>;
  createRegistrationOptions(input: {
    accountId: string;
    username: string;
    passkeys: readonly PasskeyCredential[];
  }): Promise<Readonly<{ challenge: string; options: unknown }>>;
  verifyAuthentication(input: {
    challenge: string;
    passkey: PasskeyCredential;
    response: unknown;
  }): Promise<PasskeyAuthenticationVerification>;
  verifyRegistration(input: {
    challenge: string;
    response: unknown;
    webauthnUserId: string;
  }): Promise<PasskeyRegistrationVerification>;
}
