import type { ScheduledCommand } from "../../../domain/scheduled-command";

export type SaveScheduledCommandResult =
  | Readonly<{ status: "inserted"; command: ScheduledCommand }>
  | Readonly<{ status: "existing"; command: ScheduledCommand }>;

export type LeaseMutationResult =
  | Readonly<{ status: "updated"; command: ScheduledCommand }>
  | Readonly<{
      status: "command-not-found" | "lease-mismatch" | "version-conflict";
    }>;

export interface ScheduledCommandRepositoryPort {
  claimDue(input: {
    claimedAt: string;
    leaseUntil: string;
    limit: number;
    workerId: string;
  }): Promise<readonly ScheduledCommand[]>;
  complete(input: {
    commandId: string;
    expectedVersion: number;
    workerId: string;
  }): Promise<LeaseMutationResult>;
  fail(input: {
    commandId: string;
    errorCode: string;
    expectedVersion: number;
    retryAt: string;
    workerId: string;
  }): Promise<LeaseMutationResult>;
  reconcileExpired(input: {
    limit: number;
    now: string;
  }): Promise<Readonly<{ deadLettered: number; reset: number }>>;
  save(command: ScheduledCommand): Promise<SaveScheduledCommandResult>;
}
