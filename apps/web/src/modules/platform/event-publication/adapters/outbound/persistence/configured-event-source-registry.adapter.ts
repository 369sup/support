import type { CommittedEventSourcePort } from "../../../application/ports/outbound/committed-event-source.port";
import type { EventSourceRegistryPort } from "../../../application/ports/outbound/event-source-registry.port";

export class ConfiguredEventSourceRegistryAdapter
  implements EventSourceRegistryPort
{
  private readonly sources = new Map<string, CommittedEventSourcePort>();

  get(sourceId: string) {
    return this.sources.get(sourceId) ?? null;
  }

  list() {
    return [...this.sources.values()].sort((left, right) =>
      left.sourceId.localeCompare(right.sourceId),
    );
  }

  register(source: CommittedEventSourcePort) {
    this.sources.set(source.sourceId, source);
  }

  reset() {
    this.sources.clear();
  }
}
