import "server-only";

import { randomUUID } from "node:crypto";

import type { PublicationIdGeneratorPort } from "../../application/ports/outbound/publication-id-generator.port";

export class SystemPublicationIdGeneratorAdapter
  implements PublicationIdGeneratorPort
{
  nextAttemptId() {
    return randomUUID();
  }

  nextDeadLetterId() {
    return randomUUID();
  }

  nextEventId() {
    return randomUUID();
  }
}
