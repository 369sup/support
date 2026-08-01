import { createSupabaseAuthAdminGateway } from "@support/supabase/auth/admin";

import {
  getProductionDatabase,
  getProductionSupabaseConfiguration,
} from "../../../../../production-runtime";
import {
  createGetAccountCandidateByUsernameAdapter,
  type GetAccountCandidateByUsernameAdapter,
} from "../adapters/inbound/server/get-account-candidate-by-username.adapter";
import {
  createGetPersonalAccountByUsernameAdapter,
  type GetPersonalAccountByUsernameAdapter,
} from "../adapters/inbound/server/get-personal-account-by-username.adapter";
import { PostgresAccountAdapter } from "../adapters/outbound/persistence/postgres-account.adapter";
import { PostgresAccountDeletionPrerequisiteAdapter } from "../adapters/outbound/persistence/postgres-account-deletion-prerequisite.adapter";
import { SupabaseAuthenticationAdminAdapter } from "../adapters/outbound/integration/supabase-authentication-admin.adapter";
import {
  createGetAccountReferenceByIdAdapter,
  type GetAccountReferenceByIdAdapter,
} from "../adapters/inbound/server/get-account-reference-by-id.adapter";
import { GetAccountCandidateByUsernameHandler } from "../application/queries/get-account-candidate-by-username.handler";
import { GetAccountReferenceByIdHandler } from "../application/queries/get-account-reference-by-id.handler";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";
import { DeletePersonalAccountHandler } from "../application/commands/delete-personal-account.handler";
import type { DeletePersonalAccountUseCase } from "../application/ports/inbound/delete-personal-account.use-case";
import { ApplyAccountIdentityTransactionHandler } from "../application/commands/apply-account-identity-transaction.handler";
import type { ApplyAccountIdentityTransactionUseCase } from "../application/ports/inbound/apply-account-identity-transaction.use-case";

export interface AccountsServerFacade {
  applyAccountIdentityTransaction: ApplyAccountIdentityTransactionUseCase["applyAccountIdentityTransaction"];
  deletePersonalAccount: DeletePersonalAccountUseCase["deletePersonalAccount"];
  getAccountCandidateByUsername: GetAccountCandidateByUsernameAdapter;
  getAccountReferenceById: GetAccountReferenceByIdAdapter;
  getPersonalAccountByUsername: GetPersonalAccountByUsernameAdapter;
}

function composeAccountsServerFacade(): AccountsServerFacade {
  const database = getProductionDatabase();
  const accountQueryRepository = new PostgresAccountAdapter(database);
  const getAccountCandidateByUsernameHandler =
    new GetAccountCandidateByUsernameHandler(accountQueryRepository);
  const getAccountReferenceByIdHandler =
    new GetAccountReferenceByIdHandler(accountQueryRepository);
  const getPersonalAccountByUsernameHandler =
    new GetPersonalAccountByUsernameHandler(accountQueryRepository);
  let deletePersonalAccountHandler: DeletePersonalAccountHandler | undefined;
  const resolveDeletePersonalAccountHandler =
    (): DeletePersonalAccountHandler => {
      const supabase = getProductionSupabaseConfiguration();
      deletePersonalAccountHandler ??= new DeletePersonalAccountHandler(
        accountQueryRepository,
        new PostgresAccountDeletionPrerequisiteAdapter(database),
        new SupabaseAuthenticationAdminAdapter(
          createSupabaseAuthAdminGateway({
            secretKey: supabase.secretKey,
            url: supabase.url,
          }),
        ),
      );
      return deletePersonalAccountHandler;
    };
  const applyIdentityTransaction =
    new ApplyAccountIdentityTransactionHandler(accountQueryRepository);

  return {
    applyAccountIdentityTransaction: (command) =>
      applyIdentityTransaction.applyAccountIdentityTransaction(command),
    deletePersonalAccount: (command) =>
      resolveDeletePersonalAccountHandler().deletePersonalAccount(command),
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
