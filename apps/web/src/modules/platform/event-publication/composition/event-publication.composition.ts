import { SimulatedPublicationDeliveryAdapter } from "../adapters/outbound/simulated-publication-delivery.adapter";
import { SystemPublicationClockAdapter } from "../adapters/outbound/system-publication-clock.adapter";
import { SystemPublicationIdGeneratorAdapter } from "../adapters/outbound/system-publication-id-generator.adapter";
import { ConfiguredEventSourceRegistryAdapter } from "../adapters/outbound/persistence/configured-event-source-registry.adapter";
import { PostgresContextOutboxAdapter } from "../adapters/outbound/persistence/postgres-context-outbox.adapter";
import { PostgresPublicationStateAdapter } from "../adapters/outbound/persistence/postgres-publication-state.adapter";
import { PublishPendingEventsHandler } from "../application/commands/publish-pending-events.handler";
import { RedeliverDeadLetterHandler } from "../application/commands/redeliver-dead-letter.handler";
import { RegisterEventSourceHandler } from "../application/commands/register-event-source.handler";
import type { CommittedEventSourcePort } from "../application/ports/outbound/committed-event-source.port";
import { GetPublicationMetricsHandler } from "../application/queries/get-publication-metrics.handler";
import { ListDeadLettersHandler } from "../application/queries/list-dead-letters.handler";
import type { EventRecorderPort } from "../contracts/event-recorder";
import { getProductionDatabase } from "../../../../../production-runtime";

const registry = new ConfiguredEventSourceRegistryAdapter();
const database = getProductionDatabase();
const stateRepository = new PostgresPublicationStateAdapter(database);
const delivery = new SimulatedPublicationDeliveryAdapter();
const clock = new SystemPublicationClockAdapter();
const idGenerator = new SystemPublicationIdGeneratorAdapter();

const publishHandler = new PublishPendingEventsHandler(
  registry,
  stateRepository,
  delivery,
  clock,
  idGenerator,
);
const deadLetterHandler = new ListDeadLettersHandler(stateRepository);
const redeliveryHandler = new RedeliverDeadLetterHandler(
  stateRepository,
  delivery,
  clock,
  idGenerator,
);
const metricsHandler = new GetPublicationMetricsHandler(
  stateRepository,
  registry,
  clock,
);
const registrationHandler = new RegisterEventSourceHandler(registry);

type ContextEventSource = EventRecorderPort & CommittedEventSourcePort;

function createContextEventSource(sourceId: string): ContextEventSource {
  return new PostgresContextOutboxAdapter(
    sourceId,
    database,
    idGenerator,
    clock,
  );
}

export const eventPublicationServerFacade = {
  createContextEventSource,
  getPublicationMetrics: () => metricsHandler.getPublicationMetrics(),
  listDeadLetters: (input: { sourceContext?: string }) =>
    deadLetterHandler.listDeadLetters(input),
  publishPendingEvents: (input: { limit?: number; sourceId?: string }) =>
    publishHandler.publishPendingEvents(input),
  redeliverDeadLetter: (input: { deadLetterId: string }) =>
    redeliveryHandler.redeliverDeadLetter(input),
  registerEventSource: (source: CommittedEventSourcePort) => {
    registrationHandler.registerEventSource(source);
  },
  resetDevelopmentState: () => {
    registry.reset();
  },
};
