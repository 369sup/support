import type { ScheduledCommand } from "../../../domain/scheduled-command";

export type CompleteScheduledCommandCommand = Readonly<{
  commandId: string;
  expectedVersion: number;
  workerId: string;
}>;

export type CompleteScheduledCommandResult =
  | Readonly<{ status: "completed"; command: ScheduledCommand }>
  | Readonly<{
      status: "command-not-found" | "lease-mismatch" | "version-conflict";
    }>;

export interface CompleteScheduledCommandUseCase {
  completeScheduledCommand(
    command: CompleteScheduledCommandCommand,
  ): Promise<CompleteScheduledCommandResult>;
}
