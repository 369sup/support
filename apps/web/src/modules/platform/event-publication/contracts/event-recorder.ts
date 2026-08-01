import type {
  DomainEventEnvelope,
  RecordDomainEventInput,
} from "./domain-event-envelope";

export interface EventRecorderPort {
  record<Payload>(
    input: RecordDomainEventInput<Payload>,
  ): Promise<DomainEventEnvelope<Payload>>;
}
