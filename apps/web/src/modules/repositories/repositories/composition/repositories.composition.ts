import {
  createListActivePublicRepositoriesForPersonalOwnerAdapter,
  type ListActivePublicRepositoriesForPersonalOwnerAdapter,
} from "../adapters/inbound/server/list-active-public-repositories-for-personal-owner.adapter";
import { InMemoryRepositoryQueryAdapter } from "../adapters/outbound/persistence/in-memory-repository-query.adapter";
import { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../application/queries/list-active-public-repositories-for-personal-owner.handler";

export interface RepositoriesServerFacade {
  listActivePublicRepositoriesForPersonalOwner: ListActivePublicRepositoriesForPersonalOwnerAdapter;
}

function composeRepositoriesServerFacade(): RepositoriesServerFacade {
  const repositoryQueryRepository = new InMemoryRepositoryQueryAdapter();
  const listActivePublicRepositoriesHandler =
    new ListActivePublicRepositoriesForPersonalOwnerHandler(
      repositoryQueryRepository,
    );

  return {
    listActivePublicRepositoriesForPersonalOwner:
      createListActivePublicRepositoriesForPersonalOwnerAdapter(
        listActivePublicRepositoriesHandler,
      ),
  };
}

export const repositoriesServerFacade =
  composeRepositoriesServerFacade();
