export type ApplyAuditRetentionCommand = Readonly<{
  cutoff: string;
  executionId: string;
}>;

export type ApplyAuditRetentionResult =
  | Readonly<{ status: "applied"; removedCount: number }>
  | Readonly<{ status: "already-applied"; removedCount: number }>
  | Readonly<{ status: "execution-conflict" }>;

export interface ApplyAuditRetentionUseCase {
  applyAuditRetention(
    command: ApplyAuditRetentionCommand,
  ): Promise<ApplyAuditRetentionResult>;
}
