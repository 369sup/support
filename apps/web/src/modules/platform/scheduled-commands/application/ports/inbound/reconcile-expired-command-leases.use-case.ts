export type ReconcileExpiredCommandLeasesCommand = Readonly<{
  limit?: number;
}>;

export type ReconcileExpiredCommandLeasesResult =
  | Readonly<{
      status: "reconciled";
      deadLettered: number;
      reset: number;
    }>
  | Readonly<{ status: "invalid-limit" }>;

export interface ReconcileExpiredCommandLeasesUseCase {
  reconcileExpiredCommandLeases(
    command: ReconcileExpiredCommandLeasesCommand,
  ): Promise<ReconcileExpiredCommandLeasesResult>;
}
