import type {
  RedeliverDeadLetterCommand,
  RedeliverDeadLetterResult,
  RedeliverDeadLetterUseCase,
} from "../ports/inbound/redeliver-dead-letter.use-case";
import type { PublicationClockPort } from "../ports/outbound/publication-clock.port";
import type { PublicationDeliveryPort } from "../ports/outbound/publication-delivery.port";
import type { PublicationIdGeneratorPort } from "../ports/outbound/publication-id-generator.port";
import type { PublicationStateRepositoryPort } from "../ports/outbound/publication-state.repository.port";

export class RedeliverDeadLetterHandler
  implements RedeliverDeadLetterUseCase
{
  private readonly stateRepository: PublicationStateRepositoryPort;
  private readonly delivery: PublicationDeliveryPort;
  private readonly clock: PublicationClockPort;
  private readonly idGenerator: PublicationIdGeneratorPort;

  constructor(
    stateRepository: PublicationStateRepositoryPort,
    delivery: PublicationDeliveryPort,
    clock: PublicationClockPort,
    idGenerator: PublicationIdGeneratorPort,
  ) {
    this.stateRepository = stateRepository;
    this.delivery = delivery;
    this.clock = clock;
    this.idGenerator = idGenerator;
  }

  async redeliverDeadLetter(
    command: RedeliverDeadLetterCommand,
  ): Promise<RedeliverDeadLetterResult> {
    const record = await this.stateRepository.findDeadLetter(
      command.deadLetterId,
    );
    if (record === null) {
      return { status: "dead-letter-not-found" };
    }

    const attemptedAt = this.clock.now();
    const result = await this.delivery.deliver(record.envelope);
    await this.stateRepository.recordAttempt({
      attemptId: this.idGenerator.nextAttemptId(),
      attemptedAt,
      errorCode: result.status === "failed" ? result.errorCode : null,
      eventId: record.envelope.eventId,
      outcome: result.status,
      sourceContext: record.envelope.sourceContext,
      version: 1,
    });

    if (result.status === "failed") {
      await this.stateRepository.saveDeadLetter({
        ...record,
        failedAt: attemptedAt,
        failureCount: record.failureCount + 1,
        lastErrorCode: result.errorCode,
        version: record.version + 1,
      });
      return { status: "failed", errorCode: result.errorCode };
    }

    await this.stateRepository.saveReceipt({
      deliveredAt: attemptedAt,
      eventId: record.envelope.eventId,
      version: 1,
    });
    await this.stateRepository.removeDeadLetter(record.deadLetterId);
    return { status: "delivered", eventId: record.envelope.eventId };
  }
}
