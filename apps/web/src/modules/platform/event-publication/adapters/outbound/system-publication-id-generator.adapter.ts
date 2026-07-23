import { randomUUID } from "node:crypto";

import type { PublicationIdGeneratorPort } from "../../application/ports/outbound/publication-id-generator.port";

export class SystemPublicationIdGeneratorAdapter
  implements PublicationIdGeneratorPort
{
  nextAttemptId() {
    return `publication_attempt_${randomUUID()}`;
  }

  nextDeadLetterId() {
    return `dead_letter_${randomUUID()}`;
  }

  nextEventId() {
    return `event_${randomUUID()}`;
  }
}
