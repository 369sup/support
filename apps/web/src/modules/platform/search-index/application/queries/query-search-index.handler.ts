import { calculateSearchScore } from "../../domain/search-document";
import type {
  QuerySearchIndexQuery,
  QuerySearchIndexResult,
  QuerySearchIndexUseCase,
} from "../ports/inbound/query-search-index.use-case";
import type { SearchIndexRepositoryPort } from "../ports/outbound/search-index.repository.port";

export class QuerySearchIndexHandler implements QuerySearchIndexUseCase {
  private readonly repository: SearchIndexRepositoryPort;

  constructor(repository: SearchIndexRepositoryPort) {
    this.repository = repository;
  }

  async querySearchIndex(
    query: QuerySearchIndexQuery,
  ): Promise<QuerySearchIndexResult> {
    const normalizedQuery = query.query.trim().toLocaleLowerCase("en-US");
    const candidates =
      normalizedQuery === ""
        ? []
        : (await this.repository.list())
            .filter(
              (document) =>
                query.kind === undefined || document.kind === query.kind,
            )
            .filter(
              (document) =>
                query.authorizationKey === undefined ||
                document.authorizationKeys.includes(query.authorizationKey),
            )
            .map((document) => ({
              authorizationKeys: document.authorizationKeys,
              documentId: document.documentId,
              kind: document.kind,
              score: calculateSearchScore(document, normalizedQuery),
              sourceContext: document.sourceContext,
              sourceVersion: document.sourceVersion,
              title: document.title,
            }))
            .filter((candidate) => candidate.score > 0)
            .sort((left, right) => {
              const scoreDifference = right.score - left.score;
              return scoreDifference !== 0
                ? scoreDifference
                : left.title.localeCompare(right.title);
            })
            .slice(0, Math.min(100, Math.max(1, query.limit ?? 20)));
    return { status: "found", candidates };
  }
}
