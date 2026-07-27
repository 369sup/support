import "server-only";

import { randomUUID } from "node:crypto";

import type {
  CommittedEventSourcePort,
  DomainEventEnvelope,
  EventRecorderPort,
  RecordDomainEventInput,
} from "@/modules/platform/event-publication/integration-contracts";

type OutboxRecord = {
  envelope: DomainEventEnvelope;
  state: "pending" | "leased" | "dead-lettered";
};

export interface InMemoryRepositoriesOutboxState {
  recordsByEventId: Map<string, OutboxRecord>;
}

type RepositoriesOutboxDependencies = Readonly<{
  nextEventId: () => string;
  now: () => string;
}>;

declare global {
  var __supportRepositoriesOutboxStateV1:
    | InMemoryRepositoriesOutboxState
    | undefined;
}

function createState(): InMemoryRepositoriesOutboxState {
  return { recordsByEventId: new Map() };
}

function getProcessState() {
  globalThis.__supportRepositoriesOutboxStateV1 ??= createState();
  return globalThis.__supportRepositoriesOutboxStateV1;
}

const systemDependencies: RepositoriesOutboxDependencies = {
  nextEventId: () => `event_${randomUUID()}`,
  now: () => new Date().toISOString(),
};

export class InMemoryRepositoriesOutboxAdapter
  implements EventRecorderPort, CommittedEventSourcePort
{
  readonly sourceId = "repositories/repositories";
  private readonly state: InMemoryRepositoriesOutboxState;
  private readonly dependencies: RepositoriesOutboxDependencies;

  static createState() {
    return createState();
  }

  constructor(
    state: InMemoryRepositoriesOutboxState = getProcessState(),
    dependencies: RepositoriesOutboxDependencies = systemDependencies,
  ) {
    this.state = state;
    this.dependencies = dependencies;
  }

  record<Payload>(
    input: RecordDomainEventInput<Payload>,
  ): Promise<DomainEventEnvelope<Payload>> {
    const envelope = {
      ...input,
      eventId: this.dependencies.nextEventId(),
      occurredAt: this.dependencies.now(),
      sourceContext: this.sourceId,
    } satisfies DomainEventEnvelope<Payload>;
    this.state.recordsByEventId.set(envelope.eventId, {
      envelope,
      state: "pending",
    });
    return Promise.resolve(envelope);
  }

  acknowledge(eventId: string) {
    this.state.recordsByEventId.delete(eventId);
    return Promise.resolve();
  }

  claimPending(input: { claimedAt: string; limit: number }) {
    void input.claimedAt;
    const records = [...this.state.recordsByEventId.values()]
      .filter((record) => record.state === "pending")
      .sort((left, right) =>
        left.envelope.occurredAt.localeCompare(right.envelope.occurredAt),
      )
      .slice(0, input.limit);
    for (const record of records) {
      record.state = "leased";
    }
    return Promise.resolve(records.map((record) => record.envelope));
  }

  deadLetter(eventId: string) {
    const record = this.state.recordsByEventId.get(eventId);
    if (record !== undefined) {
      record.state = "dead-lettered";
    }
    return Promise.resolve();
  }

  getOldestPendingOccurredAt() {
    return Promise.resolve(
      [...this.state.recordsByEventId.values()]
        .filter((record) => record.state === "pending")
        .map((record) => record.envelope.occurredAt)
        .sort()[0] ?? null,
    );
  }

  release(eventId: string) {
    const record = this.state.recordsByEventId.get(eventId);
    if (record !== undefined && record.state === "leased") {
      record.state = "pending";
    }
    return Promise.resolve();
  }

  reset() {
    this.state.recordsByEventId.clear();
  }
}
