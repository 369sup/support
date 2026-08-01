import type { AuditExportJob } from "../../../domain/audit-storage-record";

export type CreateAuditExportCommand = Readonly<{
  scopeId: string;
  scopeKind: "account" | "organization" | "enterprise" | "repository";
}>;

export type CreateAuditExportResult = Readonly<{
  status: "completed";
  export: AuditExportJob;
}>;

export interface CreateAuditExportUseCase {
  createAuditExport(
    command: CreateAuditExportCommand,
  ): Promise<CreateAuditExportResult>;
}
