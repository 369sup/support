import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

import type { SecurityRuntimeGatewayPort } from "../../../application/ports/outbound/security-runtime.gateway.port";

function decodeEncryptionKey(encodedKey: string | undefined): Buffer {
  if (encodedKey === undefined || encodedKey.trim() === "") {
    return randomBytes(32);
  }
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) {
    throw new Error(
      "AUTH_FACTOR_ENCRYPTION_KEY must be a base64-encoded 32-byte key.",
    );
  }
  return key;
}

export class NodeSecurityRuntimeAdapter
  implements SecurityRuntimeGatewayPort
{
  private readonly encryptionKey: Buffer;

  constructor(encodedEncryptionKey?: string) {
    this.encryptionKey = decodeEncryptionKey(encodedEncryptionKey);
  }

  hashSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
  }

  now(): Date {
    return new Date();
  }

  protectSecret(secret: string): string {
    const initializationVector = randomBytes(12);
    const cipher = createCipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      initializationVector,
    );
    const encrypted = Buffer.concat([
      cipher.update(secret, "utf8"),
      cipher.final(),
    ]);
    return [
      initializationVector.toString("base64url"),
      cipher.getAuthTag().toString("base64url"),
      encrypted.toString("base64url"),
    ].join(".");
  }

  randomId(): string {
    return randomUUID();
  }

  randomRecoveryCode(): string {
    return randomBytes(12).toString("base64url");
  }

  revealSecret(protectedSecret: string): string {
    const parts = protectedSecret.split(".");
    if (parts.length !== 3) {
      throw new Error("Protected authentication secret is malformed.");
    }
    const initializationVector = Buffer.from(parts[0] ?? "", "base64url");
    const authenticationTag = Buffer.from(parts[1] ?? "", "base64url");
    const encrypted = Buffer.from(parts[2] ?? "", "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      this.encryptionKey,
      initializationVector,
    );
    decipher.setAuthTag(authenticationTag);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  }
}
