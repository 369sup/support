import type { AuditStorageClockPort } from "../../application/ports/outbound/audit-storage-clock.port";

export class SystemAuditStorageClockAdapter implements AuditStorageClockPort {
  now() {
    return new Date().toISOString();
  }
}
