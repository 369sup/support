import type { ScheduledCommandClockPort } from "../../application/ports/outbound/scheduled-command-clock.port";

export class SystemScheduledCommandClockAdapter
  implements ScheduledCommandClockPort
{
  now(): Date {
    return new Date();
  }
}
