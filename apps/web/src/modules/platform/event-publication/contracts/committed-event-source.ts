import type { DomainEventEnvelope } from "./domain-event-envelope";

export interface CommittedEventSourcePort {
  readonly sourceId: string;
  acknowledge(eventId: string): Promise<void>;
  claimPending(input: {
    claimedAt: string;
    limit: number;
  }): Promise<readonly DomainEventEnvelope[]>;
  deadLetter(eventId: string): Promise<void>;
  getOldestPendingOccurredAt(): Promise<string | null>;
  release(eventId: string): Promise<void>;
}
