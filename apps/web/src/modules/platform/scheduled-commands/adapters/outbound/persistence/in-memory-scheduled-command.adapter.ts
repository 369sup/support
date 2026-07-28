import type {
  LeaseMutationResult,
  SaveScheduledCommandResult,
  ScheduledCommandRepositoryPort,
} from "../../../application/ports/outbound/scheduled-command.repository.port";
import type { ScheduledCommand } from "../../../domain/scheduled-command";

type ScheduledCommandStore = Map<string, ScheduledCommand>;

declare global {
  var __supportScheduledCommandStoreV1:
    | ScheduledCommandStore
    | undefined;
}

function getProcessStore(): ScheduledCommandStore {
  globalThis.__supportScheduledCommandStoreV1 ??= new Map();
  return globalThis.__supportScheduledCommandStoreV1;
}

function cloneCommand(command: ScheduledCommand): ScheduledCommand {
  return { ...command };
}

export class InMemoryScheduledCommandAdapter
  implements ScheduledCommandRepositoryPort
{
  private readonly store: ScheduledCommandStore;

  constructor(store: ScheduledCommandStore = getProcessStore()) {
    this.store = store;
  }

  claimDue(input: {
    claimedAt: string;
    leaseUntil: string;
    limit: number;
    workerId: string;
  }): Promise<readonly ScheduledCommand[]> {
    const due = [...this.store.values()]
      .filter(
        (command) =>
          command.state === "pending" &&
          command.dueAt <= input.claimedAt,
      )
      .sort((left, right) => {
        const dueComparison = left.dueAt.localeCompare(right.dueAt);
        return dueComparison === 0
          ? left.commandId.localeCompare(right.commandId)
          : dueComparison;
      })
      .slice(0, input.limit)
      .map((command) => {
        const leased: ScheduledCommand = {
          ...command,
          attemptCount: command.attemptCount + 1,
          leaseUntil: input.leaseUntil,
          state: "leased",
          version: command.version + 1,
          workerId: input.workerId,
        };
        this.store.set(leased.commandId, leased);
        return cloneCommand(leased);
      });
    return Promise.resolve(due);
  }

  complete(input: {
    commandId: string;
    expectedVersion: number;
    workerId: string;
  }): Promise<LeaseMutationResult> {
    const validation = this.validateLeaseMutation(
      this.store.get(input.commandId),
      input,
    );
    if (validation.status !== "valid") {
      return Promise.resolve(validation);
    }
    const { current } = validation;
    const completed: ScheduledCommand = {
      ...current,
      leaseUntil: null,
      state: "completed",
      version: current.version + 1,
      workerId: null,
    };
    this.store.set(completed.commandId, completed);
    return Promise.resolve({ status: "updated", command: completed });
  }

  fail(input: {
    commandId: string;
    errorCode: string;
    expectedVersion: number;
    retryAt: string;
    workerId: string;
  }): Promise<LeaseMutationResult> {
    const validation = this.validateLeaseMutation(
      this.store.get(input.commandId),
      input,
    );
    if (validation.status !== "valid") {
      return Promise.resolve(validation);
    }
    const { current } = validation;
    const isExhausted = current.attemptCount >= current.maxAttempts;
    const failed: ScheduledCommand = {
      ...current,
      dueAt: input.retryAt,
      lastErrorCode: input.errorCode,
      leaseUntil: null,
      state: isExhausted ? "dead-lettered" : "pending",
      version: current.version + 1,
      workerId: null,
    };
    this.store.set(failed.commandId, failed);
    return Promise.resolve({ status: "updated", command: failed });
  }

  reconcileExpired(input: {
    limit: number;
    now: string;
  }): Promise<Readonly<{ deadLettered: number; reset: number }>> {
    const expired = [...this.store.values()]
      .filter(
        (command) =>
          command.state === "leased" &&
          command.leaseUntil !== null &&
          command.leaseUntil <= input.now,
      )
      .sort((left, right) => left.commandId.localeCompare(right.commandId))
      .slice(0, input.limit);
    let deadLettered = 0;
    let reset = 0;
    for (const command of expired) {
      const isExhausted = command.attemptCount >= command.maxAttempts;
      this.store.set(command.commandId, {
        ...command,
        leaseUntil: null,
        state: isExhausted ? "dead-lettered" : "pending",
        version: command.version + 1,
        workerId: null,
      });
      if (isExhausted) {
        deadLettered += 1;
      } else {
        reset += 1;
      }
    }
    return Promise.resolve({ deadLettered, reset });
  }

  save(command: ScheduledCommand): Promise<SaveScheduledCommandResult> {
    const existing = this.store.get(command.commandId);
    if (existing !== undefined) {
      return Promise.resolve({
        status: "existing",
        command: cloneCommand(existing),
      });
    }
    this.store.set(command.commandId, cloneCommand(command));
    return Promise.resolve({ status: "inserted", command });
  }

  private validateLeaseMutation(
    current: ScheduledCommand | undefined,
    input: {
      expectedVersion: number;
      workerId: string;
    },
  ):
    | Exclude<LeaseMutationResult, { status: "updated" }>
    | Readonly<{ status: "valid"; current: ScheduledCommand }> {
    if (current === undefined) {
      return { status: "command-not-found" };
    }
    if (current.version !== input.expectedVersion) {
      return { status: "version-conflict" };
    }
    if (current.state !== "leased" || current.workerId !== input.workerId) {
      return { status: "lease-mismatch" };
    }
    return { status: "valid", current };
  }
}
