import type {
  PublishPendingEventsCommand,
  PublishPendingEventsResult,
  PublishPendingEventsUseCase,
} from "../ports/inbound/publish-pending-events.use-case";
import type { EventSourceRegistryPort } from "../ports/outbound/event-source-registry.port";
import type { PublicationClockPort } from "../ports/outbound/publication-clock.port";
import type { PublicationDeliveryPort } from "../ports/outbound/publication-delivery.port";
import type { PublicationIdGeneratorPort } from "../ports/outbound/publication-id-generator.port";
import type { PublicationStateRepositoryPort } from "../ports/outbound/publication-state.repository.port";

const maximumAutomaticAttempts = 3;
const maximumBatchSize = 100;

export class PublishPendingEventsHandler
  implements PublishPendingEventsUseCase
{
  private readonly registry: EventSourceRegistryPort;
  private readonly stateRepository: PublicationStateRepositoryPort;
  private readonly delivery: PublicationDeliveryPort;
  private readonly clock: PublicationClockPort;
  private readonly idGenerator: PublicationIdGeneratorPort;

  constructor(
    registry: EventSourceRegistryPort,
    stateRepository: PublicationStateRepositoryPort,
    delivery: PublicationDeliveryPort,
    clock: PublicationClockPort,
    idGenerator: PublicationIdGeneratorPort,
  ) {
    this.registry = registry;
    this.stateRepository = stateRepository;
    this.delivery = delivery;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async publishPendingEvents(
    command: PublishPendingEventsCommand,
  ): Promise<PublishPendingEventsResult> {
    const sources =
      command.sourceId === undefined
        ? this.registry.list()
        : [this.registry.get(command.sourceId)].filter(
            (source) => source !== null,
          );
    if (command.sourceId !== undefined && sources.length === 0) {
      return { status: "source-not-found" };
    }

    const counters = {
      deadLettered: 0,
      delivered: 0,
      duplicates: 0,
      retried: 0,
    };
    const limit = Math.min(
      maximumBatchSize,
      Math.max(1, command.limit ?? maximumBatchSize),
    );

    for (const source of sources) {
      const claimedAt = this.clock.now();
      const envelopes = await source.claimPending({ claimedAt, limit });
      for (const envelope of envelopes) {
        if (await this.stateRepository.hasReceipt(envelope.eventId)) {
          await source.acknowledge(envelope.eventId);
          counters.duplicates += 1;
          continue;
        }

        const attemptedAt = this.clock.now();
        const result = await this.delivery.deliver(envelope);
        await this.stateRepository.recordAttempt({
          attemptId: this.idGenerator.nextAttemptId(),
          attemptedAt,
          errorCode: result.status === "failed" ? result.errorCode : null,
          eventId: envelope.eventId,
          outcome: result.status,
          sourceContext: envelope.sourceContext,
          version: 1,
        });

        if (result.status === "delivered") {
          await this.stateRepository.saveReceipt({
            deliveredAt: attemptedAt,
            eventId: envelope.eventId,
            version: 1,
          });
          await source.acknowledge(envelope.eventId);
          counters.delivered += 1;
          continue;
        }

        const failureCount =
          await this.stateRepository.getFailureCount(envelope.eventId);
        if (failureCount >= maximumAutomaticAttempts) {
          await this.stateRepository.saveDeadLetter({
            deadLetterId: this.idGenerator.nextDeadLetterId(),
            envelope,
            failedAt: attemptedAt,
            failureCount,
            lastErrorCode: result.errorCode,
            version: 1,
          });
          await source.deadLetter(envelope.eventId);
          counters.deadLettered += 1;
        } else {
          await source.release(envelope.eventId);
          counters.retried += 1;
        }
      }
    }

    return { status: "published", ...counters };
  }
}
