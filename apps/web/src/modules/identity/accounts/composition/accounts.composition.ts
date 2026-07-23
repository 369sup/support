import {
  createGetPersonalAccountByUsernameAdapter,
  type GetPersonalAccountByUsernameAdapter,
} from "../adapters/inbound/server/get-personal-account-by-username.adapter";
import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";

export interface AccountsServerFacade {
  getPersonalAccountByUsername: GetPersonalAccountByUsernameAdapter;
}

function composeAccountsServerFacade(): AccountsServerFacade {
  const accountQueryRepository = new InMemoryAccountQueryAdapter();
  const getPersonalAccountByUsernameHandler =
    new GetPersonalAccountByUsernameHandler(accountQueryRepository);

  return {
    getPersonalAccountByUsername:
      createGetPersonalAccountByUsernameAdapter(
        getPersonalAccountByUsernameHandler,
      ),
  };
}

export const accountsServerFacade = composeAccountsServerFacade();
