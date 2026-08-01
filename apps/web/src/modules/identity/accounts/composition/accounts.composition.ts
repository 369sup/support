import {
  createGetPersonalAccountByUsernameAdapter,
  type GetPersonalAccountByUsernameAdapter,
} from "../adapters/inbound/server/get-personal-account-by-username.adapter";
import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import {
  createGetAccountReferenceByIdAdapter,
  type GetAccountReferenceByIdAdapter,
} from "../adapters/inbound/server/get-account-reference-by-id.adapter";
import { GetAccountReferenceByIdHandler } from "../application/queries/get-account-reference-by-id.handler";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";

export interface AccountsServerFacade {
  getAccountReferenceById: GetAccountReferenceByIdAdapter;
  getPersonalAccountByUsername: GetPersonalAccountByUsernameAdapter;
}

function composeAccountsServerFacade(): AccountsServerFacade {
  const accountQueryRepository = new InMemoryAccountQueryAdapter();
  const getAccountReferenceByIdHandler =
    new GetAccountReferenceByIdHandler(accountQueryRepository);
  const getPersonalAccountByUsernameHandler =
    new GetPersonalAccountByUsernameHandler(accountQueryRepository);

  return {
    getAccountReferenceById: createGetAccountReferenceByIdAdapter(
      getAccountReferenceByIdHandler,
    ),
    getPersonalAccountByUsername:
      createGetPersonalAccountByUsernameAdapter(
        getPersonalAccountByUsernameHandler,
      ),
  };
}

export const accountsServerFacade = composeAccountsServerFacade();
