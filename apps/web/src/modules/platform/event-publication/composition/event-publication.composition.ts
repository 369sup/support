import { SimulatedPublicationDeliveryAdapter } from "../adapters/outbound/simulated-publication-delivery.adapter";
import { SystemPublicationClockAdapter } from "../adapters/outbound/system-publication-clock.adapter";
import { SystemPublicationIdGeneratorAdapter } from "../adapters/outbound/system-publication-id-generator.adapter";
import { InMemoryEventSourceRegistryAdapter } from "../adapters/outbound/persistence/in-memory-event-source-registry.adapter";
import {
  InMemoryPublicationStateAdapter,
} from "../adapters/outbound/persistence/in-memory-publication-state.adapter";
import { PublishPendingEventsHandler } from "../application/commands/publish-pending-events.handler";
import { RedeliverDeadLetterHandler } from "../application/commands/redeliver-dead-letter.handler";
import { RegisterEventSourceHandler } from "../application/commands/register-event-source.handler";
import type { CommittedEventSourcePort } from "../application/ports/outbound/committed-event-source.port";
import { GetPublicationMetricsHandler } from "../application/queries/get-publication-metrics.handler";
import { ListDeadLettersHandler } from "../application/queries/list-dead-letters.handler";

const registry = new InMemoryEventSourceRegistryAdapter();
const stateRepository = new InMemoryPublicationStateAdapter();
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

export const eventPublicationServerFacade = {
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
    stateRepository.reset();
  },
};
