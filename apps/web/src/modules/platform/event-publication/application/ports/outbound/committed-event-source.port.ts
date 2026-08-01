import type { PublicationEventEnvelope } from "../../../domain/publication-record";

export interface CommittedEventSourcePort {
  readonly sourceId: string;
  acknowledge(eventId: string): Promise<void>;
  claimPending(input: {
    claimedAt: string;
    limit: number;
  }): Promise<readonly PublicationEventEnvelope[]>;
  deadLetter(eventId: string): Promise<void>;
  getOldestPendingOccurredAt(): Promise<string | null>;
  release(eventId: string): Promise<void>;
}
