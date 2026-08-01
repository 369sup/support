import "server-only";

import { createHash } from "node:crypto";

import type { MediaHasherPort } from "../../application/ports/outbound/media-hasher.port";

export class SystemMediaHasherAdapter implements MediaHasherPort {
  checksum(content: Uint8Array) {
    return createHash("sha256").update(content).digest("hex");
  }
}
