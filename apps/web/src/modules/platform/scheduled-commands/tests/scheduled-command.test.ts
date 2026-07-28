import { describe, expect, it } from "vitest";

import { InMemoryScheduledCommandAdapter } from "../adapters/outbound/persistence/in-memory-scheduled-command.adapter";
import type { ScheduledCommandClockPort } from "../application/ports/outbound/scheduled-command-clock.port";
import { ScheduledCommandService } from "../application/services/scheduled-command.service";

class ClockFake implements ScheduledCommandClockPort {
  current = new Date("2026-07-28T00:00:00.000Z");

  now(): Date {
    return this.current;
  }
}

function createService() {
  const clock = new ClockFake();
  return {
    clock,
    service: new ScheduledCommandService(
      new InMemoryScheduledCommandAdapter(new Map()),
      clock,
    ),
  };
}

describe("scheduled commands", () => {
  it("schedules idempotently and claims due commands once per lease", async () => {
    const { service } = createService();
    const schedule = {
      commandId: "scheduled-command-1",
      commandName: "expire-session",
      dueAt: "2026-07-27T23:59:00.000Z",
      maxAttempts: 3,
      ownerContext: "identity/authentication",
      payload: { sessionId: "session-1" },
    };
    await expect(
      service.scheduleCommand(schedule),
    ).resolves.toMatchObject({ status: "scheduled" });
    await expect(
      service.scheduleCommand(schedule),
    ).resolves.toMatchObject({ status: "already-scheduled" });
    await expect(
      service.claimDueScheduledCommands({
        leaseSeconds: 60,
        limit: 10,
        workerId: "worker-1",
      }),
    ).resolves.toMatchObject({
      status: "claimed",
      commands: [{ state: "leased", attemptCount: 1 }],
    });
    await expect(
      service.claimDueScheduledCommands({
        leaseSeconds: 60,
        limit: 10,
        workerId: "worker-2",
      }),
    ).resolves.toEqual({ status: "claimed", commands: [] });
  });

  it("uses worker and version compare-and-set on completion", async () => {
    const { service } = createService();
    await service.scheduleCommand({
      commandId: "scheduled-command-2",
      commandName: "expire-session",
      dueAt: "2026-07-27T23:59:00.000Z",
      maxAttempts: 3,
      ownerContext: "identity/authentication",
      payload: {},
    });
    const claimed = await service.claimDueScheduledCommands({
      leaseSeconds: 60,
      workerId: "worker-1",
    });
    if (claimed.status !== "claimed" || claimed.commands[0] === undefined) {
      return;
    }
    const command = claimed.commands[0];
    await expect(
      service.completeScheduledCommand({
        commandId: command.commandId,
        expectedVersion: command.version - 1,
        workerId: "worker-1",
      }),
    ).resolves.toEqual({ status: "version-conflict" });
    await expect(
      service.completeScheduledCommand({
        commandId: command.commandId,
        expectedVersion: command.version,
        workerId: "worker-1",
      }),
    ).resolves.toMatchObject({ status: "completed" });
  });

  it("reconciles an expired final-attempt lease to dead letter", async () => {
    const { clock, service } = createService();
    await service.scheduleCommand({
      commandId: "scheduled-command-3",
      commandName: "expire-session",
      dueAt: "2026-07-27T23:59:00.000Z",
      maxAttempts: 1,
      ownerContext: "identity/authentication",
      payload: {},
    });
    await service.claimDueScheduledCommands({
      leaseSeconds: 60,
      workerId: "worker-1",
    });
    clock.current = new Date("2026-07-28T00:02:00.000Z");
    await expect(
      service.reconcileExpiredCommandLeases({ limit: 10 }),
    ).resolves.toEqual({
      status: "reconciled",
      deadLettered: 1,
      reset: 0,
    });
  });
});
