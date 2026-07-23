import { publicRepositoryQueryRuntime } from "../adapters/inbound/server/public-repository-query-runtime.adapter";
import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../application/queries/list-active-public-repositories-for-personal-owner.handler";

const repositoryQueryRepository = new InMemoryRepositoryQueryAdapter();
const listActivePublicRepositoriesHandler =
  new ListActivePublicRepositoriesForPersonalOwnerHandler(
    repositoryQueryRepository,
  );

export function initializeRepositoriesComposition() {
  publicRepositoryQueryRuntime.configure(listActivePublicRepositoriesHandler);
}
