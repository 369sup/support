import { auditStorageServerFacade } from "./composition/audit-storage.composition";

export const appendAuditRecord = auditStorageServerFacade.appendAuditRecord;
export const applyAuditRetention = auditStorageServerFacade.applyAuditRetention;
export const createAuditExport = auditStorageServerFacade.createAuditExport;
export const queryAuditRecords = auditStorageServerFacade.queryAuditRecords;
