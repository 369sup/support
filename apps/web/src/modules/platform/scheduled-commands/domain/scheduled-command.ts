export type ScheduledCommandState =
  | "pending"
  | "leased"
  | "completed"
  | "dead-lettered";

export type ScheduledCommand = Readonly<{
  attemptCount: number;
  commandId: string;
  commandName: string;
  dueAt: string;
  lastErrorCode: string | null;
  leaseUntil: string | null;
  maxAttempts: number;
  ownerContext: string;
  payload: unknown;
  state: ScheduledCommandState;
  version: number;
  workerId: string | null;
}>;
