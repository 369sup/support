import type { GetPersonalAccountByUsernameHandler } from "../../../application/queries/get-personal-account-by-username.handler";

let handler: GetPersonalAccountByUsernameHandler | undefined;

export const personalAccountQueryRuntime = {
  configure(nextHandler: GetPersonalAccountByUsernameHandler) {
    handler = nextHandler;
  },
  getHandler() {
    if (handler === undefined) {
      throw new Error("Personal account query runtime is not configured.");
    }

    return handler;
  },
};
