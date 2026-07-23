import type { CommittedEventSourcePort } from "./committed-event-source.port";

export interface EventSourceRegistryPort {
  get(sourceId: string): CommittedEventSourcePort | null;
  list(): readonly CommittedEventSourcePort[];
  register(source: CommittedEventSourcePort): void;
}
