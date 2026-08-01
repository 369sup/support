export type RedeliverDeadLetterCommand = Readonly<{
  deadLetterId: string;
}>;

export type RedeliverDeadLetterResult =
  | Readonly<{ status: "delivered"; eventId: string }>
  | Readonly<{ status: "failed"; errorCode: string }>
  | Readonly<{ status: "dead-letter-not-found" }>;

export interface RedeliverDeadLetterUseCase {
  redeliverDeadLetter(
    command: RedeliverDeadLetterCommand,
  ): Promise<RedeliverDeadLetterResult>;
}
