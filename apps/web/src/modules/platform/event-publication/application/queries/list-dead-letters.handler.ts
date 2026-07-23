import { toDeadLetterSummary } from "../../domain/publication-record";
import type {
  ListDeadLettersQuery,
  ListDeadLettersResult,
  ListDeadLettersUseCase,
} from "../ports/inbound/list-dead-letters.use-case";
import type { PublicationStateRepositoryPort } from "../ports/outbound/publication-state.repository.port";

export class ListDeadLettersHandler implements ListDeadLettersUseCase {
  private readonly stateRepository: PublicationStateRepositoryPort;

  constructor(stateRepository: PublicationStateRepositoryPort) {
    this.stateRepository = stateRepository;
  }

  async listDeadLetters(
    query: ListDeadLettersQuery,
  ): Promise<ListDeadLettersResult> {
    const records = await this.stateRepository.listDeadLetters(
      query.sourceContext,
    );
    return {
      status: "found",
      deadLetters: records.map(toDeadLetterSummary),
    };
  }
}
