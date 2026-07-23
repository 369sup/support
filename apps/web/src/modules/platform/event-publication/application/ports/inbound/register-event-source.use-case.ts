import type { CommittedEventSourcePort } from "../outbound/committed-event-source.port";

export interface RegisterEventSourceUseCase {
  registerEventSource(source: CommittedEventSourcePort): void;
}
