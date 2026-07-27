import type { RepositoryClockPort } from "../../../application/ports/outbound/repository-clock.port";

export class SystemRepositoryClockAdapter implements RepositoryClockPort {
  now(): Date {
    return new Date();
  }
}
