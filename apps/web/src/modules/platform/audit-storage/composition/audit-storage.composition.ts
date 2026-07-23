import { InMemoryAuditStorageAdapter } from "../adapters/outbound/persistence/in-memory-audit-storage.adapter";
import { SystemAuditStorageClockAdapter } from "../adapters/outbound/system-audit-storage-clock.adapter";
import { SystemAuditStorageExporterAdapter } from "../adapters/outbound/system-audit-storage-exporter.adapter";
import { SystemAuditStorageIdGeneratorAdapter } from "../adapters/outbound/system-audit-storage-id-generator.adapter";
import { AppendAuditRecordHandler } from "../application/commands/append-audit-record.handler";
import { ApplyAuditRetentionHandler } from "../application/commands/apply-audit-retention.handler";
import { CreateAuditExportHandler } from "../application/commands/create-audit-export.handler";
import { QueryAuditRecordsHandler } from "../application/queries/query-audit-records.handler";

const repository = new InMemoryAuditStorageAdapter();
const appendHandler = new AppendAuditRecordHandler(repository);
const queryHandler = new QueryAuditRecordsHandler(repository);
const exportHandler = new CreateAuditExportHandler(
  repository,
  new SystemAuditStorageClockAdapter(),
  new SystemAuditStorageExporterAdapter(),
  new SystemAuditStorageIdGeneratorAdapter(),
);
const retentionHandler = new ApplyAuditRetentionHandler(repository);

export const auditStorageServerFacade = {
  appendAuditRecord: appendHandler.appendAuditRecord.bind(appendHandler),
  applyAuditRetention:
    retentionHandler.applyAuditRetention.bind(retentionHandler),
  createAuditExport: exportHandler.createAuditExport.bind(exportHandler),
  queryAuditRecords: queryHandler.queryAuditRecords.bind(queryHandler),
};
