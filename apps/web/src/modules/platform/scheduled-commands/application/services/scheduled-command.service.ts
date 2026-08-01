import type {
  ClaimDueScheduledCommandsCommand,
  ClaimDueScheduledCommandsResult,
} from "../ports/inbound/claim-due-scheduled-commands.use-case";
import type {
  CompleteScheduledCommandCommand,
  CompleteScheduledCommandResult,
} from "../ports/inbound/complete-scheduled-command.use-case";
import type {
  FailScheduledCommandCommand,
  FailScheduledCommandResult,
} from "../ports/inbound/fail-scheduled-command.use-case";
import type {
  ReconcileExpiredCommandLeasesCommand,
  ReconcileExpiredCommandLeasesResult,
} from "../ports/inbound/reconcile-expired-command-leases.use-case";
import type {
  ScheduleCommandCommand,
  ScheduleCommandResult,
} from "../ports/inbound/schedule-command.use-case";
import type { ScheduledCommandClockPort } from "../ports/outbound/scheduled-command-clock.port";
import type { ScheduledCommandRepositoryPort } from "../ports/outbound/scheduled-command.repository.port";

const maximumBatchSize = 100;
const maximumLeaseSeconds = 3600;

function isValidTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function isSameSchedule(
  left: ScheduleCommandCommand,
  right: {
    commandId: string;
    commandName: string;
    dueAt: string;
    maxAttempts: number;
    ownerContext: string;
    payload: unknown;
  },
): boolean {
  return (
    left.commandId === right.commandId &&
    left.commandName === right.commandName &&
    left.dueAt === right.dueAt &&
    left.maxAttempts === right.maxAttempts &&
    left.ownerContext === right.ownerContext &&
    JSON.stringify(left.payload) === JSON.stringify(right.payload)
  );
}

export class ScheduledCommandService {
  private readonly repository: ScheduledCommandRepositoryPort;
  private readonly clock: ScheduledCommandClockPort;

  constructor(
    repository: ScheduledCommandRepositoryPort,
    clock: ScheduledCommandClockPort,
  ) {
    this.repository = repository;
    this.clock = clock;
  }

  async scheduleCommand(
    command: ScheduleCommandCommand,
  ): Promise<ScheduleCommandResult> {
    if (
      command.commandId.trim() === "" ||
      command.commandName.trim() === "" ||
      command.ownerContext.trim() === "" ||
      !isValidTimestamp(command.dueAt) ||
      !Number.isInteger(command.maxAttempts) ||
      command.maxAttempts < 1 ||
      command.maxAttempts > 100
    ) {
      return { status: "invalid-command" };
    }
    const result = await this.repository.save({
      attemptCount: 0,
      commandId: command.commandId,
      commandName: command.commandName,
      dueAt: command.dueAt,
      lastErrorCode: null,
      leaseUntil: null,
      maxAttempts: command.maxAttempts,
      ownerContext: command.ownerContext,
      payload: command.payload,
      state: "pending",
      version: 1,
      workerId: null,
    });
    if (result.status === "inserted") {
      return { status: "scheduled", command: result.command };
    }
    return isSameSchedule(command, result.command)
      ? { status: "already-scheduled", command: result.command }
      : { status: "schedule-conflict" };
  }

  async claimDueScheduledCommands(
    command: ClaimDueScheduledCommandsCommand,
  ): Promise<ClaimDueScheduledCommandsResult> {
    const limit = command.limit ?? maximumBatchSize;
    if (
      command.workerId.trim() === "" ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > maximumBatchSize ||
      !Number.isInteger(command.leaseSeconds) ||
      command.leaseSeconds < 1 ||
      command.leaseSeconds > maximumLeaseSeconds
    ) {
      return { status: "invalid-claim" };
    }
    const now = this.clock.now();
    const commands = await this.repository.claimDue({
      claimedAt: now.toISOString(),
      leaseUntil: new Date(
        now.getTime() + command.leaseSeconds * 1000,
      ).toISOString(),
      limit,
      workerId: command.workerId,
    });
    return { status: "claimed", commands };
  }

  async completeScheduledCommand(
    command: CompleteScheduledCommandCommand,
  ): Promise<CompleteScheduledCommandResult> {
    return this.repository.complete(command).then((result) =>
      result.status === "updated"
        ? { status: "completed", command: result.command }
        : result,
    );
  }

  async failScheduledCommand(
    command: FailScheduledCommandCommand,
  ): Promise<FailScheduledCommandResult> {
    if (
      command.errorCode.trim() === "" ||
      !isValidTimestamp(command.retryAt)
    ) {
      return { status: "invalid-failure" };
    }
    const result = await this.repository.fail(command);
    if (result.status !== "updated") {
      return result;
    }
    return {
      status:
        result.command.state === "dead-lettered"
          ? "dead-lettered"
          : "retry-scheduled",
      command: result.command,
    };
  }

  async reconcileExpiredCommandLeases(
    command: ReconcileExpiredCommandLeasesCommand,
  ): Promise<ReconcileExpiredCommandLeasesResult> {
    const limit = command.limit ?? maximumBatchSize;
    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > maximumBatchSize
    ) {
      return { status: "invalid-limit" };
    }
    const result = await this.repository.reconcileExpired({
      limit,
      now: this.clock.now().toISOString(),
    });
    return { status: "reconciled", ...result };
  }
}
