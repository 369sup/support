import type { PublicationStateRepositoryPort } from "../../../application/ports/outbound/publication-state.repository.port";
import type {
  DeadLetterRecord,
  PublicationAttempt,
  PublicationReceipt,
} from "../../../domain/publication-record";

export interface InMemoryPublicationState {
  attempts: PublicationAttempt[];
  deadLettersById: Map<string, DeadLetterRecord>;
  receiptsByEventId: Map<string, PublicationReceipt>;
}

declare global {
  var __supportEventPublicationStateV1:
    | InMemoryPublicationState
    | undefined;
}

function createInMemoryPublicationState(): InMemoryPublicationState {
  return {
    attempts: [],
    deadLettersById: new Map(),
    receiptsByEventId: new Map(),
  };
}

function getProcessState() {
  globalThis.__supportEventPublicationStateV1 ??=
    createInMemoryPublicationState();
  return globalThis.__supportEventPublicationStateV1;
}

export class InMemoryPublicationStateAdapter
  implements PublicationStateRepositoryPort
{
  private readonly state: InMemoryPublicationState;

  static createState() {
    return createInMemoryPublicationState();
  }

  constructor(state: InMemoryPublicationState = getProcessState()) {
    this.state = state;
  }

  findDeadLetter(deadLetterId: string) {
    return Promise.resolve(
      this.state.deadLettersById.get(deadLetterId) ?? null,
    );
  }

  getFailureCount(eventId: string) {
    return Promise.resolve(
      this.state.attempts.filter(
        (attempt) =>
          attempt.eventId === eventId && attempt.outcome === "failed",
      ).length,
    );
  }

  getCounts() {
    const deliveredAttempts = this.state.attempts.filter(
      (attempt) => attempt.outcome === "delivered",
    ).length;
    const failedAttempts = this.state.attempts.length - deliveredAttempts;
    return Promise.resolve({
      attempts: this.state.attempts.length,
      deadLetters: this.state.deadLettersById.size,
      deliveredAttempts,
      failedAttempts,
      receipts: this.state.receiptsByEventId.size,
    });
  }

  hasReceipt(eventId: string) {
    return Promise.resolve(this.state.receiptsByEventId.has(eventId));
  }

  listDeadLetters(sourceContext?: string) {
    return Promise.resolve(
      [...this.state.deadLettersById.values()]
        .filter(
          (record) =>
            sourceContext === undefined ||
            record.envelope.sourceContext === sourceContext,
        )
        .sort((left, right) => left.failedAt.localeCompare(right.failedAt)),
    );
  }

  recordAttempt(attempt: PublicationAttempt) {
    this.state.attempts.push(attempt);
    return Promise.resolve();
  }

  removeDeadLetter(deadLetterId: string) {
    this.state.deadLettersById.delete(deadLetterId);
    return Promise.resolve();
  }

  reset() {
    this.state.attempts.length = 0;
    this.state.deadLettersById.clear();
    this.state.receiptsByEventId.clear();
  }

  saveDeadLetter(record: DeadLetterRecord) {
    this.state.deadLettersById.set(record.deadLetterId, record);
    return Promise.resolve();
  }

  saveReceipt(receipt: PublicationReceipt) {
    this.state.receiptsByEventId.set(receipt.eventId, receipt);
    return Promise.resolve();
  }
}
