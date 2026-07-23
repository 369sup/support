import { initializeAccountsComposition } from "./composition/accounts.composition";

initializeAccountsComposition();

export type {
  PersonalAccountLookupResult,
  UserOwnerReference,
} from "./contracts/user-owner-reference";
export { getPersonalAccountByUsername } from "./adapters/inbound/server/get-personal-account-by-username.adapter";
