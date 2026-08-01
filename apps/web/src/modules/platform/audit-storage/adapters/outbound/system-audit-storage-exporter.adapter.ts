import "server-only";

import { createHash } from "node:crypto";

import type { AuditStorageExporterPort } from "../../application/ports/outbound/audit-storage-exporter.port";
import type { AuditStorageRecord } from "../../domain/audit-storage-record";

export class SystemAuditStorageExporterAdapter
  implements AuditStorageExporterPort
{
  checksum(records: readonly AuditStorageRecord[]) {
    return createHash("sha256").update(JSON.stringify(records)).digest("hex");
  }
}
