export type DomainEventEnvelope<Payload = unknown> = Readonly<{
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

export type RecordDomainEventInput<Payload = unknown> = Readonly<{
  aggregateId: string;
  aggregateVersion: number;
  eventName: string;
  eventVersion: number;
  orderingKey: string;
  payload: Payload;
}>;
