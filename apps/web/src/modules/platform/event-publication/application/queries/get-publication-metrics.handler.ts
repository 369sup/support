import type {
  GetPublicationMetricsResult,
  GetPublicationMetricsUseCase,
} from "../ports/inbound/get-publication-metrics.use-case";
import type { EventSourceRegistryPort } from "../ports/outbound/event-source-registry.port";
import type { PublicationClockPort } from "../ports/outbound/publication-clock.port";
import type { PublicationStateRepositoryPort } from "../ports/outbound/publication-state.repository.port";

export class GetPublicationMetricsHandler
  implements GetPublicationMetricsUseCase
{
  private readonly stateRepository: PublicationStateRepositoryPort;
  private readonly registry: EventSourceRegistryPort;
  private readonly clock: PublicationClockPort;

  constructor(
    stateRepository: PublicationStateRepositoryPort,
    registry: EventSourceRegistryPort,
    clock: PublicationClockPort,
  ) {
    this.stateRepository = stateRepository;
    this.registry = registry;
    this.clock = clock;
  }

  async getPublicationMetrics(): Promise<GetPublicationMetricsResult> {
    const [counts, ...oldestPendingValues] = await Promise.all([
      this.stateRepository.getCounts(),
      ...this.registry
        .list()
        .map((source) => source.getOldestPendingOccurredAt()),
    ]);
    const oldestPendingAt = oldestPendingValues
      .filter((value) => value !== null)
      .sort()[0];
    const oldestPendingLagMilliseconds =
      oldestPendingAt === undefined
        ? null
        : Math.max(0, Date.parse(this.clock.now()) - Date.parse(oldestPendingAt));

    return {
      status: "found",
      metrics: {
        ...counts,
        oldestPendingLagMilliseconds,
        retries: Math.max(0, counts.failedAttempts - counts.deadLetters),
      },
    };
  }
}
