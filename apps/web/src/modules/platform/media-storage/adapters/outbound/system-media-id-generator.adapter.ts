import { randomUUID } from "node:crypto";

import type { MediaIdGeneratorPort } from "../../application/ports/outbound/media-id-generator.port";

export class SystemMediaIdGeneratorAdapter implements MediaIdGeneratorPort {
  nextMediaId() {
    return `media_${randomUUID()}`;
  }

  storageKey(mediaId: string) {
    return `media/${mediaId}`;
  }
}
