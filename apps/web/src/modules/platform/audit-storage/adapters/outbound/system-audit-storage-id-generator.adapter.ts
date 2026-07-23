import "server-only";

import { randomUUID } from "node:crypto";

import type { AuditStorageIdGeneratorPort } from "../../application/ports/outbound/audit-storage-id-generator.port";

export class SystemAuditStorageIdGeneratorAdapter
  implements AuditStorageIdGeneratorPort
{
  nextExportId() {
    return `audit_export_${randomUUID()}`;
  }
}
