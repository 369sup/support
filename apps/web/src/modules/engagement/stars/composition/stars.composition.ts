import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresRepositoryStarAdapter } from "../adapters/outbound/persistence/postgres-repository-star.adapter";
import { ToggleRepositoryStarHandler } from "../application/commands/toggle-repository-star.handler";
import type { ListRepositoryStargazersUseCase } from "../application/ports/inbound/list-repository-stargazers.use-case";
import type { ToggleRepositoryStarUseCase } from "../application/ports/inbound/toggle-repository-star.use-case";
import { ListRepositoryStargazersHandler } from "../application/queries/list-repository-stargazers.handler";

const stars = new PostgresRepositoryStarAdapter(getProductionDatabase());
const toggleRepositoryStar = new ToggleRepositoryStarHandler(stars);
const listRepositoryStargazers = new ListRepositoryStargazersHandler(stars);

export const starsServerFacade: Readonly<{
  toggleRepositoryStar: ToggleRepositoryStarUseCase["toggleRepositoryStar"];
  listRepositoryStargazers:
    ListRepositoryStargazersUseCase["listRepositoryStargazers"];
}> = {
  toggleRepositoryStar:
    toggleRepositoryStar.toggleRepositoryStar.bind(toggleRepositoryStar),
  listRepositoryStargazers:
    listRepositoryStargazers.listRepositoryStargazers.bind(
      listRepositoryStargazers,
    ),
};
