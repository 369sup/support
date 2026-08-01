import type { RepositoryViewPermission } from "../inbound/repository-view.types";
import type { RepositoryQuerySnapshot } from "./repository-query.repository.port";

export interface RepositoryViewAuthorizationGatewayPort {
  resolveRepositoryPermission(input: {
    actorAccountId: string;
    repository: RepositoryQuerySnapshot;
  }): Promise<RepositoryViewPermission | null>;
}
