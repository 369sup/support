import type {
  DeadLetterRecord,
  PublicationAttempt,
  PublicationReceipt,
} from "../../../domain/publication-record";

export type PublicationStateCounts = Readonly<{
  attempts: number;
  deadLetters: number;
  deliveredAttempts: number;
  failedAttempts: number;
  receipts: number;
}>;

export interface PublicationStateRepositoryPort {
  findDeadLetter(deadLetterId: string): Promise<DeadLetterRecord | null>;
  getFailureCount(eventId: string): Promise<number>;
  getCounts(): Promise<PublicationStateCounts>;
  hasReceipt(eventId: string): Promise<boolean>;
  listDeadLetters(sourceContext?: string): Promise<readonly DeadLetterRecord[]>;
  recordAttempt(attempt: PublicationAttempt): Promise<void>;
  removeDeadLetter(deadLetterId: string): Promise<void>;
  saveDeadLetter(record: DeadLetterRecord): Promise<void>;
  saveReceipt(receipt: PublicationReceipt): Promise<void>;
}
