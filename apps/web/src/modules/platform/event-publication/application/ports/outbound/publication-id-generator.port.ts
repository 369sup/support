export interface PublicationIdGeneratorPort {
  nextAttemptId(): string;
  nextDeadLetterId(): string;
  nextEventId(): string;
}
