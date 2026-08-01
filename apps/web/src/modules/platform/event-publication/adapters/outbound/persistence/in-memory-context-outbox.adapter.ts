import type { CommittedEventSourcePort } from "../../../application/ports/outbound/committed-event-source.port";
import type { PublicationClockPort } from "../../../application/ports/outbound/publication-clock.port";
import type { PublicationIdGeneratorPort } from "../../../application/ports/outbound/publication-id-generator.port";
import type {
  PublicationEventEnvelope,
  RecordPublicationEventInput,
} from "../../../domain/publication-record";

type OutboxState = "pending" | "leased" | "dead-lettered";

type OutboxRecord = {
  envelope: PublicationEventEnvelope;
  state: OutboxState;
  version: number;
};

export interface InMemoryContextOutboxState {
  recordsByEventId: Map<string, OutboxRecord>;
}

function createInMemoryContextOutboxState(): InMemoryContextOutboxState {
  return { recordsByEventId: new Map() };
}

export class InMemoryContextOutboxAdapter
  implements CommittedEventSourcePort
{
  readonly sourceId: string;
  private readonly idGenerator: PublicationIdGeneratorPort;
  private readonly clock: PublicationClockPort;
  private readonly state: InMemoryContextOutboxState;

  static createState() {
    return createInMemoryContextOutboxState();
  }

  constructor(
    sourceId: string,
    idGenerator: PublicationIdGeneratorPort,
    clock: PublicationClockPort,
    state: InMemoryContextOutboxState = createInMemoryContextOutboxState(),
  ) {
    this.sourceId = sourceId;
    this.idGenerator = idGenerator;
    this.clock = clock;
    this.state = state;
  }

  record<Payload>(
    input: RecordPublicationEventInput<Payload>,
  ): Promise<PublicationEventEnvelope<Payload>> {
    const envelope = {
      ...input,
      eventId: this.idGenerator.nextEventId(),
      occurredAt: this.clock.now(),
      sourceContext: this.sourceId,
    } satisfies PublicationEventEnvelope<Payload>;
    this.state.recordsByEventId.set(envelope.eventId, {
      envelope,
      state: "pending",
      version: 1,
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
      record.version += 1;
    }
    return Promise.resolve(records.map((record) => record.envelope));
  }

  deadLetter(eventId: string) {
    const record = this.state.recordsByEventId.get(eventId);
    if (record !== undefined) {
      record.state = "dead-lettered";
      record.version += 1;
    }
    return Promise.resolve();
  }

  getOldestPendingOccurredAt() {
    return Promise.resolve(
      [...this.state.recordsByEventId.values()]
        .filter((record) => record.state === "pending")
        .map((record) => record.envelope.occurredAt)
        .sort()[0] ?? null
    );
  }

  release(eventId: string) {
    const record = this.state.recordsByEventId.get(eventId);
    if (record !== undefined && record.state === "leased") {
      record.state = "pending";
      record.version += 1;
    }
    return Promise.resolve();
  }
}
