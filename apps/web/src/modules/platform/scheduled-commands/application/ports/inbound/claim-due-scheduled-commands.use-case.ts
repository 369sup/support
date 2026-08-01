import type { ScheduledCommand } from "../../../domain/scheduled-command";

export type ClaimDueScheduledCommandsCommand = Readonly<{
  leaseSeconds: number;
  limit?: number;
  workerId: string;
}>;

export type ClaimDueScheduledCommandsResult =
  | Readonly<{
      status: "claimed";
      commands: readonly ScheduledCommand[];
    }>
  | Readonly<{ status: "invalid-claim" }>;

export interface ClaimDueScheduledCommandsUseCase {
  claimDueScheduledCommands(
    command: ClaimDueScheduledCommandsCommand,
  ): Promise<ClaimDueScheduledCommandsResult>;
}
