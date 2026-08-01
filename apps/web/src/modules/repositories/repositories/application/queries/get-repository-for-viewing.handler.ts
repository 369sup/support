import type {
  GetRepositoryForViewingQuery,
  GetRepositoryForViewingResult,
  GetRepositoryForViewingUseCase,
} from "../ports/inbound/get-repository-for-viewing.use-case";
import type { RepositoryQueryRepositoryPort } from "../ports/outbound/repository-query.repository.port";
import type { RepositoryViewAuthorizationGatewayPort } from "../ports/outbound/repository-view-authorization.gateway.port";
import { mapRepositoryView } from "../mappers/map-repository-view";

export class GetRepositoryForViewingHandler
  implements GetRepositoryForViewingUseCase
{
  private readonly repository: RepositoryQueryRepositoryPort;
  private readonly authorization: RepositoryViewAuthorizationGatewayPort;

  constructor(
    repository: RepositoryQueryRepositoryPort,
    authorization: RepositoryViewAuthorizationGatewayPort,
  ) {
    this.repository = repository;
    this.authorization = authorization;
  }

  async getRepositoryForViewing(
    query: GetRepositoryForViewingQuery,
  ): Promise<GetRepositoryForViewingResult> {
    const repository = await this.repository.findByOwnerIdAndName(
      query.ownerId,
      query.name.trim(),
    );
    if (repository === null || repository.lifecycleState === "deleted") {
      return { status: "repository-not-found" };
    }
    if (repository.visibility === "public") {
      return {
        repository: mapRepositoryView(repository, "read"),
        status: "found",
      };
    }
    if (query.actorAccountId === null) {
      return { status: "repository-not-found" };
    }
    const permission =
      await this.authorization.resolveRepositoryPermission({
        actorAccountId: query.actorAccountId,
        repository,
      });
    return permission === null
      ? { status: "repository-not-found" }
      : {
          status: "found",
          repository: mapRepositoryView(repository, permission),
        };
  }
}
