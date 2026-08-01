import "server-only";

import {
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

import type { AccountEmailRuntimeGatewayPort } from "../../application/ports/outbound/account-email-runtime.gateway.port";

export class NodeAccountEmailRuntimeAdapter
  implements AccountEmailRuntimeGatewayPort
{
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  now(): Date {
    return new Date();
  }

  randomId(): string {
    return randomUUID();
  }

  randomToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
