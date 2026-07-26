import {
  createGetAccountCandidateByUsernameAdapter,
  type GetAccountCandidateByUsernameAdapter,
} from "../adapters/inbound/server/get-account-candidate-by-username.adapter";
import {
  createGetPersonalAccountByUsernameAdapter,
  type GetPersonalAccountByUsernameAdapter,
} from "../adapters/inbound/server/get-personal-account-by-username.adapter";
import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import {
  createGetAccountReferenceByIdAdapter,
  type GetAccountReferenceByIdAdapter,
} from "../adapters/inbound/server/get-account-reference-by-id.adapter";
import { GetAccountCandidateByUsernameHandler } from "../application/queries/get-account-candidate-by-username.handler";
import { GetAccountReferenceByIdHandler } from "../application/queries/get-account-reference-by-id.handler";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";
import { DeletePersonalAccountHandler } from "../application/commands/delete-personal-account.handler";
import type { DeletePersonalAccountUseCase } from "../application/ports/inbound/delete-personal-account.use-case";

export interface AccountsServerFacade {
  deletePersonalAccount: DeletePersonalAccountUseCase["deletePersonalAccount"];
  getAccountCandidateByUsername: GetAccountCandidateByUsernameAdapter;
  getAccountReferenceById: GetAccountReferenceByIdAdapter;
  getPersonalAccountByUsername: GetPersonalAccountByUsernameAdapter;
}

function composeAccountsServerFacade(): AccountsServerFacade {
  const accountQueryRepository = new InMemoryAccountQueryAdapter();
  const getAccountCandidateByUsernameHandler =
    new GetAccountCandidateByUsernameHandler(accountQueryRepository);
  const getAccountReferenceByIdHandler =
    new GetAccountReferenceByIdHandler(accountQueryRepository);
  const getPersonalAccountByUsernameHandler =
    new GetPersonalAccountByUsernameHandler(accountQueryRepository);
  const deletePersonalAccountHandler =
    new DeletePersonalAccountHandler(accountQueryRepository);

  return {
    deletePersonalAccount:
      deletePersonalAccountHandler.deletePersonalAccount.bind(
        deletePersonalAccountHandler,
      ),
    getAccountCandidateByUsername:
      createGetAccountCandidateByUsernameAdapter(
        getAccountCandidateByUsernameHandler,
      ),
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
