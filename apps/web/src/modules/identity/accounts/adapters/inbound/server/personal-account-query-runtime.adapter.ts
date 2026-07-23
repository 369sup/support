import type { GetPersonalAccountByUsernameUseCase } from "../../../application/ports/inbound/get-personal-account-by-username.use-case";

let useCase: GetPersonalAccountByUsernameUseCase | undefined;

export const personalAccountQueryRuntime = {
  configure(nextUseCase: GetPersonalAccountByUsernameUseCase) {
    useCase = nextUseCase;
  },
  getPersonalAccountByUsernameUseCase() {
    if (useCase === undefined) {
      throw new Error("Personal account query runtime is not configured.");
    }

    return useCase;
  },
};
