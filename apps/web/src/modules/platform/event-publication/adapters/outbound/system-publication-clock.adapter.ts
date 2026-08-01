import type { PublicationClockPort } from "../../application/ports/outbound/publication-clock.port";

export class SystemPublicationClockAdapter implements PublicationClockPort {
  now() {
    return new Date().toISOString();
  }
}
