import "server-only";

import { randomUUID } from "node:crypto";

import type { ChannelRuntimeGatewayPort } from "../../application/ports/outbound/channel-runtime.gateway.port";

export class NodeChannelRuntimeAdapter
  implements ChannelRuntimeGatewayPort
{
  now(): Date {
    return new Date();
  }

  randomId(): string {
    return randomUUID();
  }
}
