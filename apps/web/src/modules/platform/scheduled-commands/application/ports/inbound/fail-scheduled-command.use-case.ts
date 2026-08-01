import type { ScheduledCommand } from "../../../domain/scheduled-command";

export type FailScheduledCommandCommand = Readonly<{
  commandId: string;
  errorCode: string;
  expectedVersion: number;
  retryAt: string;
  workerId: string;
}>;

export type FailScheduledCommandResult =
  | Readonly<{
      status: "dead-lettered" | "retry-scheduled";
      command: ScheduledCommand;
    }>
  | Readonly<{
      status:
        | "command-not-found"
        | "invalid-failure"
        | "lease-mismatch"
        | "version-conflict";
    }>;

export interface FailScheduledCommandUseCase {
  failScheduledCommand(
    command: FailScheduledCommandCommand,
  ): Promise<FailScheduledCommandResult>;
}
