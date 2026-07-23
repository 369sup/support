import type { ListActivePublicRepositoriesForPersonalOwnerHandler } from "../../../application/queries/list-active-public-repositories-for-personal-owner.handler";

let handler:
  | ListActivePublicRepositoriesForPersonalOwnerHandler
  | undefined;

export const publicRepositoryQueryRuntime = {
  configure(nextHandler: ListActivePublicRepositoriesForPersonalOwnerHandler) {
    handler = nextHandler;
  },
  getHandler() {
    if (handler === undefined) {
      throw new Error("Public repository query runtime is not configured.");
    }

    return handler;
  },
};
