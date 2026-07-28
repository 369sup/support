import "server-only";

import { Secret, TOTP } from "otpauth";

import type {
  TotpEnrollment,
  TotpGatewayPort,
  TotpValidation,
} from "../../../application/ports/outbound/totp.gateway.port";

export class OtpauthTotpAdapter implements TotpGatewayPort {
  createEnrollment(label: string): TotpEnrollment {
    const secret = new Secret({ size: 20 });
    const totp = new TOTP({
      algorithm: "SHA1",
      digits: 6,
      issuer: "Support",
      label,
      period: 30,
      secret,
    });
    return {
      provisioningUri: totp.toString(),
      secret: secret.base32,
    };
  }

  validate(secret: string, token: string): TotpValidation {
    const totp = new TOTP({
      algorithm: "SHA1",
      digits: 6,
      issuer: "Support",
      label: "account",
      period: 30,
      secret: Secret.fromBase32(secret),
    });
    const delta = totp.validate({ token, window: 1 });
    return delta === null
      ? { status: "invalid" }
      : { status: "valid", counter: totp.counter() + delta };
  }
}
