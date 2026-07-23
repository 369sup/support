import type { DeadLetterSummary } from "../../../domain/publication-record";

export type ListDeadLettersQuery = Readonly<{
  sourceContext?: string;
}>;

export type ListDeadLettersResult = Readonly<{
  status: "found";
  deadLetters: readonly DeadLetterSummary[];
}>;

export interface ListDeadLettersUseCase {
  listDeadLetters(
    query: ListDeadLettersQuery,
  ): Promise<ListDeadLettersResult>;
}
