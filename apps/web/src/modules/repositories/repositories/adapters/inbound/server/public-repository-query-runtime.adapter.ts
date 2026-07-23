import type { ListActivePublicRepositoriesForPersonalOwnerUseCase } from "../../../application/ports/inbound/list-active-public-repositories-for-personal-owner.use-case";

let useCase:
  | ListActivePublicRepositoriesForPersonalOwnerUseCase
  | undefined;

export const publicRepositoryQueryRuntime = {
  configure(nextUseCase: ListActivePublicRepositoriesForPersonalOwnerUseCase) {
    useCase = nextUseCase;
  },
  getListActivePublicRepositoriesForPersonalOwnerUseCase() {
    if (useCase === undefined) {
      throw new Error("Public repository query runtime is not configured.");
    }

    return useCase;
  },
};
