import type { RepositoryQuerySnapshot } from "./repository-query.repository.port";

export type RepositoryAdministrationAuthorizationInput = Readonly<{
  actorAccountId: string;
  repository: RepositoryQuerySnapshot;
}>;

export interface RepositoryAdministrationAuthorizationGatewayPort {
  hasRepositoryAdministration(
    input: RepositoryAdministrationAuthorizationInput,
  ): Promise<boolean>;
}
