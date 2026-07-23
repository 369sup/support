import { personalAccountQueryRuntime } from "../adapters/inbound/server/personal-account-query-runtime.adapter";
import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";

const accountQueryRepository = new InMemoryAccountQueryAdapter();
const getPersonalAccountByUsernameHandler =
  new GetPersonalAccountByUsernameHandler(accountQueryRepository);

export function initializeAccountsComposition() {
  personalAccountQueryRuntime.configure(getPersonalAccountByUsernameHandler);
}
