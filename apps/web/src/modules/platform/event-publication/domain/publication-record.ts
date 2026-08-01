export type PublicationEventEnvelope<Payload = unknown> = Readonly<{
  aggregateId: string;
  aggregateVersion: number;
  eventId: string;
  eventName: string;
  eventVersion: number;
  occurredAt: string;
  orderingKey: string;
  payload: Payload;
  sourceContext: string;
}>;

export type RecordPublicationEventInput<Payload = unknown> = Readonly<{
  aggregateId: string;
  aggregateVersion: number;
  eventName: string;
  eventVersion: number;
  orderingKey: string;
  payload: Payload;
}>;

export type PublicationAttempt = Readonly<{
  attemptId: string;
  attemptedAt: string;
  errorCode: string | null;
  eventId: string;
  outcome: "delivered" | "failed";
  sourceContext: string;
  version: 1;
}>;

export type PublicationReceipt = Readonly<{
  deliveredAt: string;
  eventId: string;
  version: 1;
}>;

export type DeadLetterRecord = Readonly<{
  deadLetterId: string;
  envelope: PublicationEventEnvelope;
  failedAt: string;
  failureCount: number;
  lastErrorCode: string;
  version: number;
}>;

export type DeadLetterSummary = Readonly<{
  aggregateId: string;
  deadLetterId: string;
  eventId: string;
  eventName: string;
  eventVersion: number;
  failedAt: string;
  failureCount: number;
  lastErrorCode: string;
  sourceContext: string;
  version: number;
}>;

export function toDeadLetterSummary(
  record: DeadLetterRecord,
): DeadLetterSummary {
  return {
    aggregateId: record.envelope.aggregateId,
    deadLetterId: record.deadLetterId,
    eventId: record.envelope.eventId,
    eventName: record.envelope.eventName,
    eventVersion: record.envelope.eventVersion,
    failedAt: record.failedAt,
    failureCount: record.failureCount,
    lastErrorCode: record.lastErrorCode,
    sourceContext: record.envelope.sourceContext,
    version: record.version,
  };
}
