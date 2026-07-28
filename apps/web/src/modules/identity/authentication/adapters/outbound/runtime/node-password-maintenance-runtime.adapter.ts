import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { PasswordMaintenanceRuntimeGatewayPort } from "../../../application/ports/outbound/password-maintenance-runtime.gateway.port";

export class NodePasswordMaintenanceRuntimeAdapter
  implements PasswordMaintenanceRuntimeGatewayPort
{
  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  now(): Date {
    return new Date();
  }

  randomToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
