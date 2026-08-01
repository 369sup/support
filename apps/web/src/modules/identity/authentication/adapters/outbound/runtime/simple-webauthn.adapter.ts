import "server-only";

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

import type { PasskeyCredential } from "../../../domain/account-security";
import type {
  PasskeyAuthenticationVerification,
  PasskeyRegistrationVerification,
  WebAuthnGatewayPort,
} from "../../../application/ports/outbound/webauthn.gateway.port";

type WebAuthnConfiguration = Readonly<{
  origin: string;
  rpId: string;
  rpName: string;
}>;

const authenticatorTransports = new Set<string>([
  "ble",
  "cable",
  "hybrid",
  "internal",
  "nfc",
  "smart-card",
  "usb",
]);

function isAuthenticatorTransport(
  value: string,
): value is AuthenticatorTransportFuture {
  return authenticatorTransports.has(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isAuthenticationResponse(
  value: unknown,
): value is AuthenticationResponseJSON {
  if (
    !isObject(value) ||
    typeof value["id"] !== "string" ||
    typeof value["rawId"] !== "string" ||
    value["type"] !== "public-key" ||
    !isObject(value["response"])
  ) {
    return false;
  }
  const response = value["response"];
  return (
    typeof response["authenticatorData"] === "string" &&
    typeof response["clientDataJSON"] === "string" &&
    typeof response["signature"] === "string"
  );
}

function isRegistrationResponse(
  value: unknown,
): value is RegistrationResponseJSON {
  if (
    !isObject(value) ||
    typeof value["id"] !== "string" ||
    typeof value["rawId"] !== "string" ||
    value["type"] !== "public-key" ||
    !isObject(value["response"])
  ) {
    return false;
  }
  const response = value["response"];
  return (
    typeof response["attestationObject"] === "string" &&
    typeof response["clientDataJSON"] === "string"
  );
}

export class SimpleWebAuthnAdapter implements WebAuthnGatewayPort {
  private readonly configuration: WebAuthnConfiguration;

  constructor(configuration: WebAuthnConfiguration) {
    this.configuration = configuration;
  }

  async createAuthenticationOptions(
    passkeys: readonly PasskeyCredential[],
  ): Promise<Readonly<{ challenge: string; options: unknown }>> {
    const options = await generateAuthenticationOptions({
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports.filter(
          isAuthenticatorTransport,
        ),
      })),
      rpID: this.configuration.rpId,
      userVerification: "required",
    });
    return { challenge: options.challenge, options };
  }

  async createRegistrationOptions(input: {
    accountId: string;
    username: string;
    passkeys: readonly PasskeyCredential[];
  }): Promise<Readonly<{ challenge: string; options: unknown }>> {
    const options = await generateRegistrationOptions({
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
      },
      excludeCredentials: input.passkeys.map((passkey) => ({
        id: passkey.credentialId,
      })),
      rpID: this.configuration.rpId,
      rpName: this.configuration.rpName,
      userID: new TextEncoder().encode(input.accountId),
      userName: input.username,
    });
    return { challenge: options.challenge, options };
  }

  async verifyAuthentication(input: {
    challenge: string;
    passkey: PasskeyCredential;
    response: unknown;
  }): Promise<PasskeyAuthenticationVerification> {
    if (!isAuthenticationResponse(input.response)) {
      return { status: "invalid" };
    }
    try {
      const verification = await verifyAuthenticationResponse({
        credential: {
          counter: input.passkey.counter,
          id: input.passkey.credentialId,
          publicKey: input.passkey.publicKey,
          transports: input.passkey.transports.filter(
            isAuthenticatorTransport,
          ),
        },
        expectedChallenge: input.challenge,
        expectedOrigin: this.configuration.origin,
        expectedRPID: this.configuration.rpId,
        requireUserVerification: true,
        response: input.response,
      });
      return verification.verified
        ? {
            status: "verified",
            newCounter: verification.authenticationInfo.newCounter,
          }
        : { status: "invalid" };
    } catch {
      return { status: "invalid" };
    }
  }

  async verifyRegistration(input: {
    challenge: string;
    response: unknown;
    webauthnUserId: string;
  }): Promise<PasskeyRegistrationVerification> {
    if (!isRegistrationResponse(input.response)) {
      return { status: "invalid" };
    }
    try {
      const verification = await verifyRegistrationResponse({
        expectedChallenge: input.challenge,
        expectedOrigin: this.configuration.origin,
        expectedRPID: this.configuration.rpId,
        requireUserVerification: true,
        response: input.response,
      });
      const info = verification.registrationInfo;
      if (!verification.verified || info === undefined) {
        return { status: "invalid" };
      }
      return {
        status: "verified",
        credential: {
          isBackedUp: info.credentialBackedUp,
          counter: info.credential.counter,
          credentialId: info.credential.id,
          deviceType: info.credentialDeviceType,
          publicKey: new Uint8Array(info.credential.publicKey),
          transports: info.credential.transports ?? [],
          webauthnUserId: input.webauthnUserId,
        },
      };
    } catch {
      return { status: "invalid" };
    }
  }
}
