import { starsServerFacade } from "./composition/stars.composition";

export type { RepositoryStargazer } from "./contracts/repository-star";
export const toggleRepositoryStar = starsServerFacade.toggleRepositoryStar;
export const listRepositoryStargazers =
  starsServerFacade.listRepositoryStargazers;
