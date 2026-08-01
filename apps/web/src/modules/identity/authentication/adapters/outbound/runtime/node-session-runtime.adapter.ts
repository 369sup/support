import "server-only";

import { randomUUID } from "node:crypto";

import type { SessionRuntimeGatewayPort } from "../../../application/ports/outbound/session-runtime.gateway.port";

export class NodeSessionRuntimeAdapter implements SessionRuntimeGatewayPort {
  createOpaqueId(): string {
    return randomUUID();
  }

  now(): Date {
    return new Date();
  }
}
