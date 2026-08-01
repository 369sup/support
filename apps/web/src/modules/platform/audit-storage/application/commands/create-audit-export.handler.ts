import type {
  CreateAuditExportCommand,
  CreateAuditExportResult,
  CreateAuditExportUseCase,
} from "../ports/inbound/create-audit-export.use-case";
import type { AuditStorageClockPort } from "../ports/outbound/audit-storage-clock.port";
import type { AuditStorageExporterPort } from "../ports/outbound/audit-storage-exporter.port";
import type { AuditStorageIdGeneratorPort } from "../ports/outbound/audit-storage-id-generator.port";
import type { AuditStorageRepositoryPort } from "../ports/outbound/audit-storage.repository.port";

export class CreateAuditExportHandler implements CreateAuditExportUseCase {
  private readonly repository: AuditStorageRepositoryPort;
  private readonly clock: AuditStorageClockPort;
  private readonly exporter: AuditStorageExporterPort;
  private readonly idGenerator: AuditStorageIdGeneratorPort;

  constructor(
    repository: AuditStorageRepositoryPort,
    clock: AuditStorageClockPort,
    exporter: AuditStorageExporterPort,
    idGenerator: AuditStorageIdGeneratorPort,
  ) {
    this.repository = repository;
    this.clock = clock;
    this.exporter = exporter;
    this.idGenerator = idGenerator;
  }

  async createAuditExport(
    command: CreateAuditExportCommand,
  ): Promise<CreateAuditExportResult> {
    const records = (await this.repository.listRecords()).filter(
      (record) =>
        record.scopeKind === command.scopeKind &&
        record.scopeId === command.scopeId,
    );
    const job = {
      checksum: this.exporter.checksum(records),
      completedAt: this.clock.now(),
      exportId: this.idGenerator.nextExportId(),
      recordCount: records.length,
      version: 1 as const,
    };
    await this.repository.saveExport(job);
    return { status: "completed", export: job };
  }
}
