import type { CommittedEventSourcePort } from "../../../application/ports/outbound/committed-event-source.port";
import type { EventSourceRegistryPort } from "../../../application/ports/outbound/event-source-registry.port";

declare global {
  var __supportEventSourceRegistryV1:
    | Map<string, CommittedEventSourcePort>
    | undefined;
}

function getProcessRegistry() {
  globalThis.__supportEventSourceRegistryV1 ??= new Map();
  return globalThis.__supportEventSourceRegistryV1;
}

export class InMemoryEventSourceRegistryAdapter
  implements EventSourceRegistryPort
{
  private readonly sources: Map<string, CommittedEventSourcePort>;

  constructor(
    sources: Map<string, CommittedEventSourcePort> = getProcessRegistry(),
  ) {
    this.sources = sources;
  }

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
