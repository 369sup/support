import type { ScheduledCommand } from "../../../domain/scheduled-command";

export type ScheduleCommandCommand = Readonly<{
  commandId: string;
  commandName: string;
  dueAt: string;
  maxAttempts: number;
  ownerContext: string;
  payload: unknown;
}>;

export type ScheduleCommandResult =
  | Readonly<{
      status: "scheduled" | "already-scheduled";
      command: ScheduledCommand;
    }>
  | Readonly<{ status: "invalid-command" | "schedule-conflict" }>;

export interface ScheduleCommandUseCase {
  scheduleCommand(
    command: ScheduleCommandCommand,
  ): Promise<ScheduleCommandResult>;
}
