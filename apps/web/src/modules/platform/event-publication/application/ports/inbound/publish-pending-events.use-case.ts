export type PublishPendingEventsCommand = Readonly<{
  limit?: number;
  sourceId?: string;
}>;

export type PublishPendingEventsResult =
  | Readonly<{
      status: "published";
      deadLettered: number;
      delivered: number;
      duplicates: number;
      retried: number;
    }>
  | Readonly<{ status: "source-not-found" }>;

export interface PublishPendingEventsUseCase {
  publishPendingEvents(
    command: PublishPendingEventsCommand,
  ): Promise<PublishPendingEventsResult>;
}
