import type { RegisterEventSourceUseCase } from "../ports/inbound/register-event-source.use-case";
import type { CommittedEventSourcePort } from "../ports/outbound/committed-event-source.port";
import type { EventSourceRegistryPort } from "../ports/outbound/event-source-registry.port";

export class RegisterEventSourceHandler implements RegisterEventSourceUseCase {
  private readonly registry: EventSourceRegistryPort;

  constructor(registry: EventSourceRegistryPort) {
    this.registry = registry;
  }

  registerEventSource(source: CommittedEventSourcePort) {
    this.registry.register(source);
  }
}
