import type { MediaClockPort } from "../../application/ports/outbound/media-clock.port";

export class SystemMediaClockAdapter implements MediaClockPort {
  now() {
    return new Date().toISOString();
  }
}
