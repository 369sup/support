import type { SearchResultItem, SearchResultKind } from "../../domain/search-result";
import type {
  SearchPublicResourcesResult,
  SearchPublicResourcesUseCase,
} from "../ports/inbound/search-public-resources.use-case";
import type { PublicSearchIndexGatewayPort } from "../ports/outbound/public-search-index.gateway.port";

const hrefByDocumentId: Readonly<Record<string, string>> = {
  "discussion:repository_support:1": "/octocat/support/discussions/1",
  "issue:repository_support:1": "/octocat/support/issues/1",
  "profile:account_mock": "/mock",
  "project:project_support_collaboration": "/octocat/support/projects",
  "repository:repository_support": "/octocat/support",
};

function isSearchResultKind(value: string): value is SearchResultKind {
  return ["discussion", "issue", "profile", "project", "repository"].includes(
    value,
  );
}

export class SearchPublicResourcesHandler
  implements SearchPublicResourcesUseCase
{
  private readonly index: PublicSearchIndexGatewayPort;

  constructor(index: PublicSearchIndexGatewayPort) {
    this.index = index;
  }

  async searchPublicResources(
    query: string,
  ): Promise<SearchPublicResourcesResult> {
    const candidates = await this.index.queryPublic(query);
    const results = candidates.flatMap((candidate): SearchResultItem[] => {
      const href = hrefByDocumentId[candidate.documentId];
      if (href === undefined || !isSearchResultKind(candidate.kind)) {
        return [];
      }
      return [
        {
          documentId: candidate.documentId,
          href,
          kind: candidate.kind,
          score: candidate.score,
          title: candidate.title,
        },
      ];
    });
    return { status: "found", results };
  }
}
